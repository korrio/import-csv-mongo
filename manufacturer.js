const fs = require('fs')
const csv = require('fast-csv')
const slug = require('slug')
const stream = fs.createReadStream(
  '/Users/korrio/Desktop/horezon/import/manufacturer.csv'
)
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const masterList = []
mongoose.connect('mongodb://localhost:27017/horezon')

// const ObjectId = Schema.Types.ObjectId
const ObjectId = mongoose.Types.ObjectId

// define schema for import data
const ManufacturerSchema = new Schema({
  name: { type: String, required: true, default: '' }, // ** English
  name_th: { type: String, default: '' }, // ** Thai
  slug: { type: String, index: true },
  description: { type: String }, // **

  images: [String], // **

  created_at: { type: Date, default: Date.now }, // **
  updated_at: { type: Date, default: Date.now } // **
})

// attach schema to model
const Manufacturer = mongoose.model('manufacturer', ManufacturerSchema)
function addToCollection (data) {
  // scrub data for validation

  if (data.name || data.name != '') {
    data.slug = slug(data.name, {
      lower: true
    })
  } else {
    data.name = 'brand name'
    data.slug = slug(data.name, {
      lower: true
    })
  }

  // create model and save to database
  let manufacturer = new Manufacturer(data)
  manufacturer.save(function (err) {
    if (
      err // ...
    ) {
      console.log('Error:' + err)
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
    console.log(data)
    console.log(data.name)
    masterList.push(data)
    addToCollection(data)
  })
  .on('end', function () {
    console.log('done')
  })
  .on('error', function (data) {
    return false
  })
