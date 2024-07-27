"use strict";

const rule = require("../../../lib/rules/path-checker");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {ecmaVersion: 6, sourceType: 'module'}
});

const aliasOptions = [
  {
    alias: '@'
  }
];

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
      options: aliasOptions,
    },
    {
      filename: '/home/bombin/dev/react18-app/src/entities/Article',
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными"}],
    },
  ],
});
