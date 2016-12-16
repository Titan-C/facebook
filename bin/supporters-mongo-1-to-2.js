#!/usr/bin/env nodejs
var _ = require('lodash');
var Promise = require('bluebird');
var debug = require('debug')('supporters-1-to-2');
var nconf = require('nconf');

var mongo = require('../lib/mongo');

var cfgFile = "config/settings.json";
nconf.argv().env().file({ file: cfgFile });


function takeTheGood(memo, user) {

    if(_.isUndefined(user.publicKey))
        return memo;

    var good = {
        publicKey:  user.publicKey,
        keyTime: new Date(user.keyTime),
        lastInfo: new Date(user.lastInfo),
        userId: _.parseInt(user.userId)
    };
    memo.push(good);
    return memo;
};

function howMany(lst) {
    debug("Now we've %d elements", _.size(lst));
};

function saveTheGood(good) {
    return mongo
        .upsertOne('supporters2', {
            userId: good.userId
        }, good);
};

function conversion() {
  return mongo
      .read('supporters', {}, {})
      .tap(howMany)
      .reduce(takeTheGood, [])
      .tap(howMany)
      .map(saveTheGood);
};



return conversion();
