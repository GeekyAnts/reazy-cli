import yeoman from 'yeoman-environment';

const env = yeoman.createEnv();

const reazyGenerators = 'generator-reazy/dist/generators';

env.register(require.resolve(`${reazyGenerators}/app`), 'reazy:app');
env.register(require.resolve(`${reazyGenerators}/service`), 'reazy:service');
env.register(require.resolve(`${reazyGenerators}/install-plugin`), 'reazy:install-plugin');

const generatorOptions = {
  disableNotifyUpdate: true
};

export default function(vorpal) {
  vorpal
    .command('g', 'alias for generate')
    .autocomplete(['app', 'hook', 'middleware', 'model', 'service', 'plugin'])
    .action(function (args, callback) {
      this.log('');
      env.run('reazy:app', generatorOptions, callback);
    });

  vorpal
    .command('generate ', 'alias for generate app')
    .autocomplete(['app', 'hook', 'middleware', 'model', 'service', 'plugin'])
    .action(function (args, callback) {
      this.log('');
      env.run('reazy:app', generatorOptions, callback);
    });

  vorpal
    .command('generate app')
    .description('generate new application')
    .action(function (args, callback) {
      this.log('');
      env.run('reazy:app', generatorOptions, callback);
    });

  vorpal
    .command('generate service')
    .description('generate new service')
    .action(function (args, callback) {
      this.log('');
      env.run('reazy:service', generatorOptions, callback);
    });

  vorpal
    .command('add [plugin]')
    .description('add a new plugin')
    .autocomplete(['native-config'])
    .action(function (args, callback) {
      env.run('reazy:install-plugin', args, callback);
    });
}

export { env };
