export {};
const Product = require('../model/ProductModle');
const User = require('../model/userModel');
const Post = require('../model/postModel');
const Order = require('../model/orderModel');
const mongoose = require('mongoose');
const customlog=require("../controller/loggerController")

type order={
    productName: string,
    productID: string,
    price: number,
    quantity: number,
    buyer: string,
    orderDate: Date,
    colour: string,
    fabric: string,
    userAddress: string
}

exports.placeOrder= async (req: any, res: any)=>{
    try {
        const product=await Product.findById(req.params.productId);
        const user=await User.findById(req.user._id);
        const owner=await User.findById(product.avatar);
        const newDate=new Date();
        const newOrder: order=
            {
                  productName: product.name,
                  productID: product._id,
                  price: product.price,
                  quantity: req.params.quantity,
                  buyer: req.user._id,
                  orderDate: newDate,
                  colour:req.params.colour,
                  fabric:req.params.fabric,
                  userAddress: user.address.join(', '),
        }
        const neworderdoc=await Order.create(newOrder)
        if (neworderdoc) { 
            res.json({msg:"Order Placed"});
        }
        user.myOrders.push(neworderdoc._id);
        user.save();
        owner.total_sales.push(neworderdoc._id);
        owner.save();
        customlog.log('info','route: /placeOrder/:productId/:quantity/:colour/:fabric msg: success,order placed')

    } catch (err) {
        customlog.log('error','error placing order')
        res.send({error:err});
    }
}


// Create the API route for removing an order
exports.removeOrder = async (req: any, res: any) => {
  try {
    const orderId = req.params.orderId; // Assuming orderId is passed in the request parameters

    // Find the order by ID and populate the 'buyer' field
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if the logged-in user is the buyer of the order
    // if (order.buyer._id.toString() !== req.user._id) {
    //   return res.status(403).json({ msg: 'Unauthorized to remove this order' });
    // }

    // Remove the order from the user's myOrders array
    const user = await User.findById(req.user._id);
    const orderIndex = user.myOrders.indexOf(orderId);
    if (orderIndex !== -1) {
      user.myOrders.splice(orderIndex, 1);
      await user.save();
    }

    // Remove the order from the owner's total_sales array
    const owner = await User.findById(order.buyer._id);
    const totalSalesIndex = owner.total_sales.indexOf(orderId);
    if (totalSalesIndex !== -1) {
      owner.total_sales.splice(totalSalesIndex, 1);
      await owner.save();
    }

    // Remove the order document from the Order collection
    await Order.findByIdAndRemove(orderId);

    res.json({ msg: 'Order removed successfully' });
  } catch (err) {
    console.error('Error removing order:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Create the API route for retrieving canceled products
exports.getCanceledProducts = async (req: any, res: any) => {
  try {
    // Find the logged-in user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find orders that are canceled by the user
    const canceledOrders = await Order.find({
      buyer: req.user._id,
      isCanceled: true, // Assuming you have a field to track whether the order is canceled
    });

    // Get product IDs from canceled orders
    const canceledProductIds = canceledOrders.map((order: any) => order.productID);

    // Find products using the canceled product IDs
    const canceledProducts = await Product.find({ _id: { $in: canceledProductIds } });

    // Customize the response based on your requirements
    const formattedResponse = canceledProducts.map((product: any) => ({
      productName: product.name,
      image: product.imageUrl,
      productDesc: product.productDetails,
      ownerName: product.owner.name,
      ownerId: product.owner._id,
      rating: product.rating,
      size: product.sizes_available,
      color: product.colour_available,
      price: product.price,
      discount: product.discount,
    }));

    res.json({ success: true, canceledProducts: formattedResponse });
  } catch (err) {
    console.error('Error retrieving canceled products:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
// Assuming you have a Product and User model already defined

exports.getSuccessfulOrders = async (req:any, res:any) => {
    try {
      // Find the logged-in user
      const user = await User.findById(req.user._id);
  
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Find successful orders by the user
      const successfulOrders = await Order.find({
        buyer: req.user._id,
        isCanceled: false, // Assuming you have a field to track canceled orders
      });
  
      // Get product IDs from successful orders
      const successfulProductIds = successfulOrders.map((order:any) => order.productID);
  
      // Find products using the successful product IDs
      const successfulProducts = await Product.find({ _id: { $in: successfulProductIds } });
  
      // Customize the response based on your requirements
      const formattedResponse = successfulOrders.map((order:any) => {
        const product = successfulProducts.find((p:any) => p._id.equals(order.productID));
  
        return {
          productImage: product.imageUrl,
          productName: product.name,
          deliveryAddress: user.address.join(', '), // Assuming you want the full address
          deliveryDate: order.deliveryDate, // Assuming you have a field for delivery date in your Order model
          productId: product._id,
          productOwnerName: product.owner.name,
        };
      });
  
      res.json({ success: true, successfulOrders: formattedResponse });
    } catch (err) {
      console.error('Error retrieving successful orders:', err);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
  
  
exports.myOrders= async (req: any, res: any)=>{
    try {
        const user=await User.findById(req.user._id);
        const myOrdersArray=user.myOrders;
        const myOrders = await Order.find({ '_id': { $in: myOrdersArray } });
        res.json(myOrders);
        customlog.log('info','route: /myOrders msg: success,orders fetched')

    } catch (err) {
        customlog.log('error','error fetching orders')
        res.send({error:err});
    }
}