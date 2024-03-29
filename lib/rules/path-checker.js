"use strict";

const path = require('path');

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        // node.source.value взято из AST (нода AST: "ImportDeclaration")
        const importTo = node.source.value;

        // Возвращает имя файла, связанного с ресурсом
        const fromFilename = context.getFilename();

        if(shouldBeRelative(fromFilename, importTo)) {
          context.report(node, 'В рамках одного слайса все пути должны быть относительными');
        }
      }
    };
  },
};

function isPathRelative(path) {
  return path === '.' || path.startsWith('./') || path.startsWith('../');
}

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
