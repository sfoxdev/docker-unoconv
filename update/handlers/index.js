'use strict'

const fs = require('fs')
const uuid = require('uuid')
const unoconv = require('unoconv2')
const formats = require('../lib/data/formats.json')
const pkg = require('../package.json')

module.exports.handleUpload = (request, reply) => {
  const convertToFormat = request.params.format
  const data = request.payload
  if (data.file) {
    const nameArray = data.file.hapi.filename.split('.')
    const fileEndingOriginal = nameArray.pop()
    const temporaryName = uuid.v4()
    const pathPre = process.cwd() + '/uploads/' + temporaryName
    const fileNameTempOriginal = pathPre + '.' + fileEndingOriginal
    const file = fs.createWriteStream(fileNameTempOriginal)

    file.on('error', (error) => {
      console.error(error)
    })

    fs.writeFile('./status/service_started', Date.now(), function (err) {
	if (err) 
    	    return console.log(err)
	console.log('Service started!')
    })

    fs.writeFile('./status/service_finished', 0, function (err) {
	if (err)
	    return console.log(err)
    })


    data.file.pipe(file)

    console.log('File uploaded')

    data.file.on('end', (err) => {
      if (err) {
        console.error(err)
        reply(err)
      } else {
	console.log('Start converting...')
        unoconv.convert(fileNameTempOriginal, convertToFormat, (err, result) => {
          if (err) {
	    console.error(err)	    
            fs.unlink(fileNameTempOriginal, error => {
              if (error) {
                console.error(error)
              } else {
                console.log(`${fileNameTempOriginal} deleted`)
              }
            })

            reply(err)
          } else {

            reply(result)
              .on('finish', () => {
                fs.unlink(fileNameTempOriginal, error => {
                  if (error) {

		    fs.writeFile('./status/service_finished', 0, function (err) {
			if (err)
			    return console.log(err)
			console.log('Finished converting')
		    })

                    console.error(error)
                  } else {

		    fs.writeFile('./status/service_finished', Date.now(), function (err) {
			if (err)
			    return console.log(err)
			console.log('Finished converting')
		    })

                    console.log(`${fileNameTempOriginal} deleted`)
                  }
                })
              })
          }
        })
      }
    })
  }
}

module.exports.showFormats = (request, reply) => {
  reply(formats)
}

module.exports.showFormat = (request, reply) => {
  const params = request.params
  const format = params ? formats[request.params.type] : false
  if (!format) {
    reply('Format type not found').code(404)
  } else {
    reply(format)
  }
}

module.exports.showVersions = (request, reply) => {
  let versions = {}
  Object.keys(pkg.dependencies).forEach((item) => {
    versions[item] = pkg.dependencies[item]
  })
  Object.keys(pkg.unoconv).forEach((item) => {
    versions[item] = pkg.unoconv[item]
  })
  reply(versions)
}
