## coreos-cluster-cli [![NPM version](https://badge.fury.io/js/coreos-cluster-cli.png)](http://badge.fury.io/js/coreos-cluster-cli)

Create a fully functional [CoreOs Cluster](https://coreos.com/using-coreos/) on Rackspace Cloud from the command line. A node.js sdk version of `coreos-cluster-cli` is available on npm as [`coreos-cluster`](https://npmjs.org/package/coreos-cluster).

#### Quick Example

```bash
$ coreos-cluster --username my-rackspace-username --apiKey asdf1234 --region iad
    --cluster-size 5 --release alpha
```

### Usage

```
    Usage: coreos-cluster [options]

    Options:

      -h, --help                output usage information
      -V, --version             output the version number
      -t --type [type]          type of cluster [performance]
      -b --release [release]    coreos release [stable]
      -f --flavor [flavor]      flavor for the coreos cluster [performance1-1]
      -s --cluster-size [size]  size of coreos cluster [3]
      --key-name [ssh keyname]  optional ssh keyname
      --username [username]     required or via RACKSPACE_USERNAME env variable
      --apiKey [apiKey]         required or via RACKSPACE_APIKEY env variable
      --region [region]         required or via RACKSPACE_REGION env variable

```

### Installation

```
npm install -g coreos-cluster-cli
```
