const fs = require('fs')
const csv = require('fast-csv')
const slug = require('slug')
const stream = fs.createReadStream(
  '/Users/korrio/Desktop/horezon/import/product_1.csv'
)
const mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient
const Schema = mongoose.Schema
const masterList = []
mongoose.connect('mongodb://localhost:27017/horezon')

const ObjectId = Schema.Types.ObjectId
// const ObjectId = mongoose.Types.ObjectId

// define schema for import data
const ProductSchema = new Schema({
  // _id: { type: ObjectId, default: new ObjectId() },
  sku: { type: String, index: true }, // ** SKU for product
  name: { type: String }, // ** English name
  name_th: String, // ** Thai name
  slug: { type: String, index: true }, // ** default to value form 'sku'
  description: { type: String }, // **
  attributes: [],
  // free tags
  tag: [],
  // badge, i.e. usda-organic, low-fat, no-msg
  badge: [String],
  // category, i.e. rice, body-skin, gardening
  category: [String], // ** ['10100','10100','10200']
  // reference to shop group ID
  group: [], // for production grouping
  status: { type: String, default: 'instock' }, // ** instock|oos|soldout|preorder|offline
  // Product has promotion or free shipping | value 1 and 0 when 1 is true and 0 is false
  is_shipping_free: { type: Boolean, value: false },
  has_promotion: { type: Boolean, value: false },
  is_volume_buy: { type: Boolean, value: false }, // **

  rating: Number,
  review_count: Number,
  reviews: [],

  price: Number, // ** Normal price or discount price
  full_price: Number, // Full price, used when discount price applied
  price_currency: String,

  unit_per_day: Number,

  unit_value: { type: Number }, // ** 1
  unit_code: { type: String }, // ** ลูก
  unit: { type: String }, // ** 1	ลูก

  measurement: [
    {
      value: Number,
      unitCode: String // cm, g, ml, oz
    }
  ],

  images: [String], // ** list of image URL["http://s3-something/1",'http://s3-something/2']

  // shop is not used
  // shop: { type: ObjectId, ref: 'Shop' },
  // ** manufacturer may be null
  manufacturer: { type: ObjectId, ref: 'Manufacturer' },

  created_at: { type: Date, default: Date.now }, // **
  updated_at: { type: Date, default: Date.now } // **
})

ProductSchema.pre('find', function populateFields (next) {
  this.populate('manufacturers')
  next()
})

ProductSchema.pre('findOne', function populateFields (next) {
  this.populate('manufacturers')
  next()
})

// attach schema to model
const Product = mongoose.model('products', ProductSchema)

let i = 0
function addToCollection (data) {
  // scrub data for validation
  if (data.sku || data.sku !== '') {
    data.slug = slug(data.sku, {
      lower: true
    })
  } else {
    data.slug = slug(data.sku, {
      lower: true
    })
  }

  console.log(i + ': ' + data.name)
  i++
  if (data.name || data.name !== '') {
  } else {
    data.name = ''
  }

  if (data.price == '/') {
    data.price = 0
  }

  // let a = db.collection('manufacturers').find({ 'data.name': /อิชิตัน/i })
  // console.log(a)

  // if (data.manufacturer == 'คิงเฟรทฟาร์ม') {
  //   data.manufacturer = new Manufacturer()
  // } else if (data.manufacturer == 'เจริญโภคภัณฑ์') {
  //   data.manufacturer = new Manufacturer()
  // } else {
  //   data.manufacturer = new Manufacturer()
  // }

  // create model and save to database
  let product = new Product(data)
  product.save(function (err) {
    if (
      err // ...
    ) {
      console.log(err)
    } else {
      console.log('Success added')
    }
  })
}

// read in CSV as stream row by row
csv
  .fromStream(stream, {
    headers: true,
    delimiter: ';'
  })
  .on('data', function (data) {
    masterList.push(data)
    addToCollection(data)
  })
  .on('end', function () {
    console.log('done importing')
  })
  .on('error', function (data) {
    return false
  })
