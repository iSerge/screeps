import { rules, packages } from '@eslint-stylistic/metadata';
import stylistic from '@stylistic/eslint-plugin';
console.log(packages);
export default [
  stylistic.configs['recommended-flat'],
  // ...your other config items
];
