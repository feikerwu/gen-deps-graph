import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { File } from '@babel/types';
import { transcode } from 'buffer';
import fs from 'fs';
import path from 'path';

const entry = path.resolve(__dirname, '../demo/index.ts');

/**
 * key 为文件名，vlaue 为文件的AST
 */
const astMap: Map<string, File> = new Map();

/**
 * 每个文件可以被看作是一个图节点，文件名标识其唯一ID
 */
const fileNodes: Set<string> = new Set();

/**
 * 图的邻接表表示
 */
const adjacent: Map<string, Array<string>> = new Map();

function getAST(filename: string): File {
  const code = fs.readFileSync(filename, { encoding: 'utf-8' });
  const ast = parse(code, { sourceType: 'module', plugins: ['typescript'] });
  return ast;
}

function traverseGraph(node: File, filename: string) {
  fileNodes.add(filename);
  adjacent.set(filename, []);
  traverse(node, {
    ImportDeclaration: (cur) => {
      let importedFile = path.resolve(
        path.dirname(entry),
        cur.node.source.value
      );

      importedFile = `${importedFile}.ts`;
      adjacent.get(filename).push(importedFile);

      if (!fileNodes.has(importedFile)) {
        let importedFileAst = getAST(importedFile);
        astMap.set(importedFile, importedFileAst);
        traverseGraph(importedFileAst, importedFile);
      }
    },
  });
}

const entryFile = getAST(entry);
traverseGraph(entryFile, entry);

function run() {
  const entryFile = getAST(entry);
  return traverseGraph(entryFile, entry);
}
