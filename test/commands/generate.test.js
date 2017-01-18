import _ from 'lodash';
import assert from 'assert';
import vorpalBuilder from 'vorpal';
import commands, { env } from '../../src/commands/generate';

describe('reazy-cli', () => {

  const vorpal = vorpalBuilder();
  commands(vorpal);

  describe('generator-reazy registration', () => {
    it('has registered the generator name', () => {
      assert(_.includes(env.getGeneratorNames(), 'reazy'));
    });

    it('registers all namespaces', () => {
      let expected = [
        'reazy:app',
        'reazy:service'
      ];

      assert.equal(_.difference(expected, env.namespaces()).length, 0, `namespaces() is incomplete: ${env.namespaces()}`);
    });
  });
});
