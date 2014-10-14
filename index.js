#!/usr/bin/env node

var program = require('commander'),
    colors = require('colors'),
    Cluster = require('coreos-cluster').Cluster,
    Table = require('easy-table'),
    _ = require('lodash');

var pkg = require('./package.json');

program
  .version(pkg.version)
  .option('-t --type [type]', 'type of cluster [performance]', 'performance')
  .option('-r --release [release]', 'coreos release [stable]', 'stable')
  .option('-f --flavor [flavor]', 'flavor for the coreos cluster [performance1-1]')
  .option('--cluster-size [size]', 'size of coreos cluster [3]', 3)
  .option('--key-name [ssh keyname]', 'optional ssh keyname')
  .option('--username [username]', 'required or via RACKSPACE_USERNAME env variable')
  .option('--apiKey [apiKey]', 'required or via RACKSPACE_APIKEY env variable')
  .option('--region [region]', 'required or via RACKSPACE_REGION env variable')
  .parse(process.argv);

var options = {
  type: program.type,
  release: program.release,
  size: program.clusterSize,
  credentials: {
    username: program.username || process.env.RACKSPACE_USERNAME,
    apiKey: program.apiKey || process.env.RACKSPACE_APIKEY,
    region: program.region || process.env.RACKSPACE_REGION
  }
};

if (!options.credentials.region ||
  !options.credentials.username ||
  !options.credentials.apiKey) {
  program.help();
  process.exit(2);
}

if (program.flavor) {
  options.flavor = program.flavor;
}
if (program.keyName) {
  options.keyname = program.keyName;
}

var cluster;

try {
  cluster = new Cluster(options);
}
catch (e) {
  terminate(e, true);
}

console.log(colors.green('Starting coreos-cluster create...'));
console.log(colors.yellow('  Type: ') + colors.green(cluster.type));
console.log(colors.yellow('  Release: ') + colors.green(cluster.release));
console.log(colors.yellow('  Flavor: ') + colors.green(cluster.flavor));
console.log(colors.yellow('  Size: ') + colors.green(cluster.size));

process.stdout.write(colors.yellow('\ncoreos-cluster initializing...'));
cluster.initialize(function(err) {
  if (err) {
    terminate(err);
  }

  process.stdout.write(colors.green('done: \n'));
  console.log(colors.yellow('  SSH Key: ') + colors.green(cluster.keyname));
  console.log(colors.yellow('  Service Discovery URL: ') + colors.green(cluster._serviceDiscoveryUrl));

  console.log(colors.red('\nCreating Servers...') + colors.gray(' this may take a few minutes...\n'));

  var interval = setInterval(function() {
    process.stdout.write(colors.gray('.'));
  }, 2500);

  cluster.provision(function(err) {
    clearInterval(interval);
    process.stdout.write(colors.gray('done!\n\n'));

    if (err) {
      terminate(err);
    }

    var t = new Table;

    Object.keys(cluster._servers).forEach(function(name) {
      var server = cluster._servers[name];
      t.cell('Name', server.name);
      t.cell('IP', _.find(server.addresses.public, function(ip) {
        return ip.version === 4;
      }).addr);
      t.cell('Status', server.status);
      t.cell('ID', server.id);
      t.newRow();
    });

    t.sort(['Name']);

    console.log(t.toString());

    console.log(colors.yellow('  Service Discovery URL: ') + colors.green(cluster._serviceDiscoveryUrl));
    console.log(colors.yellow('  SSH Key: ') + colors.green(cluster.keyname));

    if (cluster._keypair) {
      console.log(colors.yellow('  Private Key: ') + colors.green(cluster._keypair.private_key));
      console.log(colors.yellow('  Public Key: ') + colors.green(cluster._keypair.public_key));
      console.log(colors.red('WARNING: You must save your ssh private key, this will not be displayed again'));
    }

    console.log(colors.green('\nSUCCESS!'));
  });
});

function terminate(reason, help) {
  console.error(colors.red(reason));
  if (help) {
    program.help();
  }
  process.exit(1);
}