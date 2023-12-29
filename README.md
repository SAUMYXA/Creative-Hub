## ✨ An E-Commerce Website ✨

Welcome to the Awesome E-Commerce API, a robust platform that powers your online shopping experience! This API provides a comprehensive set of features, allowing developers to build exciting and engaging e-commerce applications.

**Blast Off with Features:**

This Node.js backend takes your project to new heights with powerful features like:

* **Category Commander:** Upload and manage categories with stunning images, letting users navigate your space with ease.
* **SKU Sorcerer:** Generate unique SKUs like magic, keeping your inventory organized and ready for launch.
* **3D Image Alchemist:** Upload and process 3D images, bringing your products to life and captivating your audience.
* **Order Overlord:** Place, remove, and retrieve orders with intuitive controls, ensuring customer satisfaction every step of the way.
* **Logging Lorekeeper:** Track every action with detailed logs, keeping your project history clear and accessible.
* **Payment Paladin:** Integrate with Razorpay for secure and smooth transactions, making checkout a breeze.

**Chart Your Course:**

1. **Install & Equip:** Blast off by installing dependencies with `npm install`.
2. **Fuel Up:** Set your environment variables like `BUCKET_NAME` and `RAZORPAY_API_KEY` to power the system.
3. **Launch Engines:** Ignite the project with `npm start` and watch your creation come online.

**️ Explore the API Territories:**

* **`/uploadCategories`:** Conquer new categories with this image-uploading outpost.
* **`/getCategories`:** Gather intel on all available categories with a single command.
* **`/upload3d`:** Unfurl the power of 3D by uploading immersive product visuals.
* **`/generatesku`:** Generate unique stock identifiers with the touch of a button.
* **`/placeOrder/:productId/:quantity/:colour/:fabric`:** Place orders like a pro, specifying product details and options.
* **`/removeOrder/:orderId`:** Eliminate unwanted orders with precision strikes.
* **`/getCanceledProducts`:** Retrieve fallen comrades (canceled products) for evaluation.
* **`/getSuccessfulOrders`:** Celebrate victories with a list of successfully completed orders.
* **`/myOrders`:** Access your personal order history and track your past conquests.
* **`/checkout`:** Initiate secure Razorpay checkout, transforming prospects into loyal customers.
* **`/paymentVerification`:** Confirm payment success with Razorpay's magic powers.


Certainly! Below is a well-structured and styled README file for your application's API, incorporating the provided functionality:

---

## Table of Contents

- [Authentication and User Management](#authentication-and-user-management)
- [Product Exploration and Interaction](#product-exploration-and-interaction)
- [Product Management and User Actions](#product-management-and-user-actions)
- [Order and Payment Management](#order-and-payment-management)
- [Category and Design Management](#category-and-design-management)
- [Social Features and User Interactions](#social-features-and-user-interactions)
- [Additional Functionality](#additional-functionality)

---

## Authentication and User Management

### `loginRouter`

Facilitates user login using username and password, returning an authorization token upon successful authentication.

### `registerRouter`

Handles user registration, creating a new user account with the provided credentials and profile information.

### `logout`

Terminates the user session and invalidates the associated authorization token, ensuring secure application access.

### `forgotPassword`

Triggers a password reset workflow, sending a recovery email with a temporary token for password change.

### `resetPasswordGet`

Initiates the password reset process based on a valid temporary token, allowing users to set a new, secure password.

### `profile`

Provides access to and manipulation of user profile data, including personal information and preferences.

### `getUserInfo`

Retrieves detailed information about a specific user, including profile data and activity history.

---

## Product Exploration and Interaction

### `uploadProduct`

Uploads product information including images, descriptions, and specifications, making it visible for user browsing and purchase.

### `getallPost`

Fetches a paginated list of user-generated posts, enabling content discovery and exploration.

### `postInfo`

Retrieves detailed information about a specific user-generated post, including comments, reactions, and associated media.

### `likeProduct`

Registers a "like" action on a product, indicating user appreciation and potentially boosting its visibility.

### `getLikedProducts`

Retrieves a list of all products a user has marked as "liked," providing personalized recommendations.

### `uploadPost`

Allows users to publish their own content, including text, images, and videos, to the platform.

### `likePost`

Registers a "like" action on a user-generated post, fostering community engagement and content appreciation.

---

## Product Management and User Actions

### `getAllProduct`

Retrieves a paginated list of all available products based on filters and sorting criteria.

### `productInfo`

Fetches detailed information about a specific product, including images, reviews, and availability.

### `getLikedPosts`

Retrieves a list of all posts a user has marked as "liked," facilitating content review and engagement.

### `addtoWishlist`

Adds a product to the user's wishlist for future reference and potential purchase.

### `removeFromWishlist`

Removes a product from the user's wishlist, adjusting their personalized collection.

### `getWishlistByListName`

Retrieves a specific wishlist by name, enabling multiple wishlist management.

### `postReviewProduct`

Allows users to write and submit reviews for specific products, providing valuable feedback for other users.

### `addRatingProduct`

Submits a star rating for a specific product, contributing to its overall rating and user perception.

### `getReviewProduct`

Retrieves the aggregated reviews and ratings for a specific product, informing purchase decisions.

---

## Order and Payment Management

### `placeOrder`

Creates a new order for a chosen product, specifying quantity, color, fabric, and delivery details.

### `removeOrder`

Cancels an existing order before its fulfillment, preventing unwanted purchases.

### `getCanceledProducts`

Retrieves a list of all canceled products for inventory management and analysis.

### `myOrders`

Provides access to a list of all user orders, including their status, history, and tracking information.

### `getSuccessfulOrders`

Fetches a list of successfully completed orders, allowing users to review past purchases.

---

## Category and Design Management

### `setCategory`

Creates or updates product categories, organizing the product catalog for improved user navigation.

### `getAllCategories`

Retrieves a list of all available product categories, enabling product filtering and browsing.

### `upload3d`

Uploads and processes 3D product models, enriching the user experience and product visualization.

### `uploadZigy`

Uploads and processes Zigy model data, supporting advanced product customization features.

---

## Social Features and User Interactions

### `getUserPosts`

Retrieves a list of all posts created by a specific user, offering insights into their activity.

### `getUserFollowing`

Fetches a list of users a specific user is following, revealing their social connections.

### `getUserFollowers`

Retrieves a list of users who are following a specific user, indicating their popularity and reach.

### `getAllPooledDesigns`

Retrieves all designs currently participating in shared "pools," encouraging collaborative creativity.

### `getOtherUserInfo`

Retrieves detailed information about another user, providing context for social interactions.

---

## Additional Functionality

### `removefromCart`

Removes a product from the user's shopping cart, adjusting their intended purchases.

### `getCart`

Retrieves the contents of the user's shopping cart, facilitating review and checkout.

### `getDeliveryAddress`

Fetches the user's default or specified delivery address for order fulfillment.

### `removeAddressById`

Deletes a specific user address from their registered options.

### `postRatingProduct`

Submits a star rating for a specific product, contributing to its overall evaluation.

### `getRatingProduct`

Retrieves the aggregated reviews and ratings for a specific product, informing purchase decisions.

---

Feel free to explore and integrate these endpoints into your application. Happy coding!

---

*Note: Make sure to replace placeholder names like `loginRouter`, `registerRouter`, etc., with the actual endpoint names used in your application.*
