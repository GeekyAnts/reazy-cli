import yeoman from 'yeoman-environment';

const env = yeoman.createEnv();

const feathersGenerators = 'generator-reazy/generators';

env.register(require.resolve(`${feathersGenerators}/app`), 'reazy:app');
env.register(require.resolve(`${feathersGenerators}/service`), 'reazy:service');

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
}

export { env };
