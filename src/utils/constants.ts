import { AccountStates } from '../types/account';

export const MINUTE = 60 * 1000;

export const DEFAULT_HRP = 'sm';

export const DEFAULT_ACCOUNT_STATES: AccountStates = {
  current: {
    balance: '0',
    nonce: '0',
  },
  projected: {
    balance: '0',
    nonce: '0',
  },
};

export const DEFAULT_EXPLORER_URL = 'https://explorer.spacemesh.io';

export const BUTTON_ICON_SIZE = 16;

export const MAIN_MENU_BUTTONS_SIZE = { base: 18, md: 24 };

export const MAX_MULTISIG_AMOUNT = 10;

export const GENESIS_VESTING_ACCOUNTS = {
  sm1qqqqqqpdvm9pwx07d99ajgnuj8rp250u90xt4jczwd873: 2743200000000000n,
  sm1qqqqqqx4shtr69586rtnx2j69hvsp9yeen0q8asqv7duy: 5867100000000000n,
  sm1qqqqqqqg5232gg5xytss9z0rwj5pw4k39c9e3ugqt6s9a: 1022800000000000n,
  sm1qqqqqqx35amk872dx5z3le6rzm56qxfm6fea4qsclrtrz: 409000000000000n,
  sm1qqqqqq8dp9dd27ym74p5e3c0xjyem6079xvfwfsk2hlwh: 2045400000000000n,
  sm1qqqqqqxg3ymt0zga3h6vexf2d6ak7n94yamck6qfk98m8: 270600000000000n,
  sm1qqqqqqygvd32u5g8a6tvccjx38ecmnakw576j0g0dsh9n: 4090900000000000n,
  sm1qqqqqqqqgh8qhqh3ltv9uq0klm404lwjsf9jdagh7kyj0: 333300000000000n,
  sm1qqqqqq8upt9xtyt5lclxneqmdpaus6j37ma2ecc4fp5qq: 859100000000000n,
  sm1qqqqqqrfa0yrzehxujdn7w400afw2e7pv4na2ac8sya0k: 293300000000000n,
  sm1qqqqqqz3hlf5mjvt7gcpkxnsxd7fahr3zksl0psds3uwj: 1990600000000000n,
  sm1qqqqqqxehnxnamgm5cqdtuqvg7jnhnsq5ug3s4g3d2xa7: 409100000000000n,
  sm1qqqqqqz43tzlzqyp695je2tk68a7r707vzxuc0ghj8awp: 2933540000000000n,
  sm1qqqqqqqm5aejp8saqp0mq7z5tkxw6vfd9v2nu2gekut5s: 2933540000000000n,
  sm1qqqqqqq79464hj2atpy6qv8unnaxnm8aqy7t6ygf4hrgf: 2933540000000000n,
  sm1qqqqqqz8egxnx83k8kehaqpdjmz3dy88xsgawggmcfxnf: 2933540000000000n,
  sm1qqqqqqqqyatumnx5e0nqgzt38yq7f5x4vlu5uugeyyst4: 2933540000000000n,
  sm1qqqqqq85pglqtxzjy63h9edgxnh5uellc95xwsqhlgzd2: 4909100000000000n,
  sm1qqqqqq93xns99ssc9ctu5jr7ss7ehy55gjut3uq9kfd9c: 191800000000000n,
  sm1qqqqqqxf6g4xetjunwkfdrlj0ns88zxzkhfd0dg5wrnul: 3303792000000000n,
  sm1qqqqqqr7pfnc4e9mgwhvnwwl6fg20hu023f27jqss3545: 455300000000000n,
  sm1qqqqqqxm7vhlzs8uxse3tjypnma2pkre60fuawclhkryu: 831250000000000n,
  sm1qqqqqq9ww5yvweyvpnz8lfmavarn9wgjwtphvrslej2hk: 184375000000000n,
  sm1qqqqqq9mcx6ekgn95gh86pwcvcfyhekzkkfawsqpm2uud: 15000000000000n,
  sm1qqqqqqxy58hpd7hqdzt97ce3qlqar2j3wrnh4csu2f0wl: 100000000000000n,
  sm1qqqqqqz85un25dd5gaahjeqgxu46aefq3wsxrpsjttk6u: 500000000000000n,
  sm1qqqqqqzlqnewes9h04ruzfxny982yf7dunz984q09ej4x: 15688500000000000n,
};
export const GENESIS_VESTING_START = 105120;
export const GENESIS_VESTING_END = 420480;
