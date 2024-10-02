"use strict";

const {isPathRelative} = require('../helpers');
const micromatch = require('micromatch');

module.exports = {
  meta: {
    type: null,
    docs: {
      description: 'public api imports',
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
          },
          testFilesPatterns: {
            type: 'array'
          }
        }
      }
    ],
  },

  create(context) {
    const { alias = '', testFilesPatterns = [] } = context.options[0] ?? {};

    // Словарь с названием проверяемых сегментов (слоев)
    const checkingLayers = {
      'entities': 'entities',
      'features': 'features',
      'pages': 'pages',
      'widgets': 'widgets',
    }

    return {
      ImportDeclaration(node) {
        // node.source.value взято из AST (нода AST: "ImportDeclaration")
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, '') : value;

        if(isPathRelative(importTo)) {
          return false;
        }

        const segments = importTo.split('/');
        const layer = segments[0];
        
        if(!checkingLayers[layer]) {
          return false;
        }
        
        const isImportNotFromPublicApi = (
          segments.length > 2 && segments[3] !== 'index.js' 
        ) || (
          segments.length > 3 && segments[3] === 'index.js'
        );
        
        const isTestingPublicApi = segments[2] === 'testing' && segments.length < 4;

        if(isImportNotFromPublicApi && !isTestingPublicApi) {
          context.report(node, 'Absolute import is allowed only from the Public API (index.ts)');
        }

        if(isTestingPublicApi) {
          const currentFilePath = context.getFilename();

          const isCurrentFileTesting = testFilesPatterns.some(
            (pattern) => micromatch.isMatch(currentFilePath, pattern)
          );

          if(!isCurrentFileTesting) {
            context.report(node, 'Test data must be imported from publicApi/testing.ts');
          }
        }
      }
    };
  },
};
