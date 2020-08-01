const { src, dest, parallel } = require('gulp')
var yaml = require('gulp-yaml')
const path = '.'

let setting = {
  schema: 'DEFAULT_SAFE_SCHEMA',
  space: 2,
  safe: true,
}

const outputFolder = `${path}/public/docs`
const yamls = ['node-swagger.yaml']
const needParallels = yamls.map((yamlPath) => {
  const func = () =>
    src(`${path}/${yamlPath}`).pipe(yaml(setting)).pipe(dest(outputFolder))
  Object.defineProperty(func, 'name', { value: yamlPath, writable: false })
  return func
})

exports.default = parallel(...needParallels)
