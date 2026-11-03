import assert from 'node:assert/strict';
import { test } from 'node:test';
import { highlightText } from '../Plastopol CMS/src/lib/search.ts';

test('matches source text rather than generated entities', () => {
  assert.equal(highlightText('A & B', 'amp'), 'A &amp; B');
  assert.equal(highlightText('A & B', '&'), 'A <mark>&amp;</mark> B');
  assert.equal(highlightText('<chair>', '<'), '<mark>&lt;</mark>chair&gt;');
});
test('escapes matched and unmatched HTML', () => {
  assert.equal(highlightText('<script>alert(1)</script>', 'script'),
    '&lt;<mark>script</mark>&gt;alert(1)&lt;/<mark>script</mark>&gt;');
});
test('supports literals, case, repeated matches and blank queries', () => {
  assert.equal(highlightText('A+B a+b', ' a+b '), '<mark>A+B</mark> <mark>a+b</mark>');
  assert.equal(highlightText('&<>', ' '), '&amp;&lt;&gt;');
  assert.equal(highlightText('Chair', 'table'), 'Chair');
});
