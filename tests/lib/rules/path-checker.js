/**
 * @fileoverview feature sliced relative path checker
 * @author alexander
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {ecmaVersion: 6, sourceType: 'module'}
});

ruleTester.run("path-checker", rule, {
  valid: [
    {
      filename: '/home/bombin/dev/react18-app/src/entities/Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
      errors: [],
    },
  ],
  invalid: [
    {
      filename: '/home/bombin/dev/react18-app/src/entities/Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными"}],
      options: [
        {
          alias: '@'
        }
      ]
    },
    {
      filename: '/home/bombin/dev/react18-app/src/entities/Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными"}],
    },
  ],
});
