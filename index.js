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
  .option('--num-nodes [number]', 'number of nodes to create (or add)', parseInt)
  .option('--discovery-service-url [url]', 'url for an existing cluster discovery service')
  .option('--private-network [guid]', 'guid for an optional private network')
  .option('--monitoring-token [guid]', 'guid for optional rackspace cloud monitoring')
  .option('--key-name [ssh keyname]', 'optional ssh keyname')
  .option('--updateGroup [group]', 'optional update group')
  .option('--updateServer [server]', 'optional endpoint for updates')
  .option('--username [username]', 'required or via RACKSPACE_USERNAME env variable')
  .option('--apiKey [apiKey]', 'required or via RACKSPACE_APIKEY env variable')
  .option('--region [region]', 'required or via RACKSPACE_REGION env variable')
  .parse(process.argv);

var options = {
  type: program.type,
  release: program.release,
  update: {
  },
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
if (program.discoveryServiceUrl) {
  options.discoveryServiceUrl = program.discoveryServiceUrl;
}
if (program.privateNetwork) {
  options.privateNetwork = program.privateNetwork;
}
if (program.monitoringToken) {
  options.monitoringToken = program.monitoringToken;
}

if (program.updateGroup) {
  options.update.group = program.updateGroup;
}

if (program.updateServer) {
  options.update.server = program.updateServer;
}

var cluster, interval;

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
console.log(colors.yellow('  Number of Nodes: ') + colors.green(program.numNodes));

process.stdout.write(colors.yellow('\ncoreos-cluster initializing...'));
cluster.initialize(function(err) {
  if (err) {
    terminate(err);
  }

  process.stdout.write(colors.green('done: \n'));
  console.log(colors.yellow('  SSH Key: ') + colors.green(cluster.keyname));
  console.log(colors.yellow('  Service Discovery URL: ') + colors.green(cluster.discoveryServiceUrl));

  console.log('\n' + colors.blue('Validating cluster options and total number of nodes...'));

  cluster.validateNodeOptions(function(err, currentNodes) {
    if (err) {
      terminate(err);
    }

    console.log(colors.blue('  Found ') + colors.green(currentNodes + ' current nodes') + colors.blue(' for cluster ' + cluster._clusterToken));
    console.log(colors.blue('  Adding ') + colors.green(program.numNodes + ' nodes') + colors.blue(' to cluster ' + cluster._clusterToken + '\n'));

    if (currentNodes + program.numNodes < 3) {
      terminate('Total number of nodes must be at least 3');
    }

    if (currentNodes) {
      console.log(colors.red('\nAdd New Servers To Cluster...') + colors.gray(' this may take a few minutes...\n'));
    }
    else {
      console.log(colors.red('\nCreating Servers For New Cluster...') + colors.gray(' this may take a few minutes...\n'));
    }

    interval = setInterval(function() {
      process.stdout.write(colors.gray('.'));
    }, 2500);

    cluster.addNodes(program.numNodes, handleProvision)
  });

  function handleProvision(err) {
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

    console.log(colors.yellow('  Service Discovery URL: ') + colors.green(cluster.discoveryServiceUrl));
    console.log(colors.yellow('  SSH Key: ') + colors.green(cluster.keyname));

    if (cluster._keypair) {
      console.log(colors.yellow('  Private Key: ') + colors.green(cluster._keypair.private_key));
      console.log(colors.yellow('  Public Key: ') + colors.green(cluster._keypair.public_key));
      console.log(colors.red('WARNING: You must save your ssh private key, this will not be displayed again'));
    }

    console.log(colors.green('\nSUCCESS!'));
  }
});

function terminate(reason, help) {
  console.error(colors.red(reason));
  if (help) {
    program.help();
  }
  process.exit(1);
}
