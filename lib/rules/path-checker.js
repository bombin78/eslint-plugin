"use strict";

const path = require('path');
const {isPathRelative} = require('../helpers');

module.exports = {
  meta: {
    type: null,
    docs: {
      description: 'feature sliced relative path checker',
      recommended: false,
      url: null,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          }
        }
      }
    ],
  },

  create(context) {
    const alias = context.options[0]?.alias || '';

    return {
      ImportDeclaration(node) {
        // node.source.value взято из AST (нода AST: "ImportDeclaration")
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, '') : value;

        // Возвращает имя файла, связанного с ресурсом
        // Например: /home/user/dev/react18-app/src/entities/Article
        const fromFilename = context.getFilename();

        if(shouldBeRelative(fromFilename, importTo)) {
          context.report(node, 'Within the same slice, all paths must be relative');
        }
      }
    };
  },
};

// Словарь с названием проверяемых сегментов (слоев)
const layers = {
  'entities': 'entities',
  'features': 'features',
  'shared': 'shared',
  'pages': 'pages',
  'widgets': 'widgets',
}

// Должен ли быть путь относительным
function shouldBeRelative(from, to) {

  if(isPathRelative(to)) {
    return false;
  }

  const toArray = to.split('/');
  const toLayer = toArray[0]; // Слой
  const toSlice = toArray[1]; // Слайс

  if(!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  const fromNormalizedPath = path.toNamespacedPath(from);
  const isWindowsOS = fromNormalizedPath.includes('\\');

  // Разбиваем путь на две части по 'src' и берем вторую
  // часть, так как нас интересует часть начиная с 'src'
  const fromPath = fromNormalizedPath.split('src')[1];

  // Здесь для windows используется разбивка по обратному 
  // слэшу, который необходимо экранировать 
  // (поэтому, для windows, указываем два обратных слэша)
  const fromArray = fromPath.split(isWindowsOS ? '\\' : '/');

  // В fromArray слой начинается со второго элемента
  const fromLayer = fromArray[1]; // Слой
  const fromSlice = fromArray[2]; // Слайс

  if(!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && fromLayer === toLayer;
}
