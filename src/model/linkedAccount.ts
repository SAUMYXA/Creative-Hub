// linkedAccountModel.ts
export{}
const mongoose = require('mongoose');

const linkedAccountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  reference_id: String,
  legal_business_name: {
    type: String,
    required: true,
  },
  business_type: {
    type: String,
    required: true,
  },
  contact_name: {
    type: String,
    required: true,
  },
  profile: {
    category: String,
    subcategory: String,
    addresses: {
      registered: {
        street1: String,
        street2: String,
        city: String,
        state: String,
        postal_code: String,
        country: String,
      },
    },
  },
  legal_info: {
    pan: String,
    gst: String,
  },
  // Add other fields as needed
}, {
  timestamps: true,
});

const LinkedAccount = mongoose.model('LinkedAccount', linkedAccountSchema);

module.exports = LinkedAccount;
