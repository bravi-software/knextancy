import debug from 'debug';


export default (namespace) => debug(`knextancy:${namespace || '*'}`);
