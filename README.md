## coreos-cluster-cli [![NPM version](https://badge.fury.io/js/coreos-cluster-cli.png)](http://badge.fury.io/js/coreos-cluster-cli)

Create a fully functional [CoreOS Cluster](https://coreos.com/using-coreos/) on Rackspace Cloud from the command line. A node.js sdk version of `coreos-cluster-cli` is available on npm as [`coreos-cluster`](https://npmjs.org/package/coreos-cluster).

#### Quick Example

```bash
$ coreos-cluster --username my-rackspace-username --apiKey asdf1234 --region iad
    --num-nodes 5 --release alpha
```

![example usage](coreos-cluster.gif)

### Usage

```
    Usage: coreos-cluster [options]

    Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -t --type [type]               type of cluster [performance]
    -r --release [release]         coreos release [stable]
    -f --flavor [flavor]           flavor for the coreos cluster [performance1-1]
    --num-nodes [number]           number of nodes to create (or add)
    --discovery-service-url [url]  url for an existing cluster discovery service
    --private-network [guid]       guid for an optional private network
    --monitoring-token [guid]      guid for optional rackspace cloud monitoring
    --ephemeral                    optional use data disk for Docker storage
    --key-name [ssh keyname]       optional ssh keyname
    --username [username]          required or via RACKSPACE_USERNAME env variable
    --apiKey [apiKey]              required or via RACKSPACE_APIKEY env variable
    --region [region]              required or via RACKSPACE_REGION env variable

```

### Installation

```
npm install -g coreos-cluster-cli
```

### More Information

#### Private Network
`coreos-cluster-cli` now supports adding a `--private-network [guid]` to each machine on the cluster, and will bind `etcd` to this private network. This is only available for `performance` type clusters. To get the guid of a private network in the desired region, please access the rackspace control panel.

#### Adding to an existing cluster
You can now provide the `--discovery-service-url [url]` of an existing cluster. Doing so will add `--num-nodes` to the current cluster, instead of registering a new cluster.

#### Cloud Monitoring
If you provide `--monitoring-token [token]` to your call, all of the created nodes will be registered with Cloud Monitoring. You can get an existing Cloud Monitoring token via the API: http://docs.rackspace.com/cm/api/v1.0/cm-devguide/content/service-agent-tokens.html#service-agent-token-list
