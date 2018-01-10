'use strict';

var should = require('chai').should();
var bitcore = require('btcnano-lib');
var Networks = bitcore.Networks;

describe('signature checks', function() {

  it('has no false positive on refund validation', function() {
    var consumer = getFundedConsumer().consumer;
    consumer.setupRefund();
    consumer.refundTx.sign(providerKey);

    // Change nLockTime to change the commitment's transaction hash
    consumer.refundTx.nLockTime = 1;

    (function() {
      consumer.validateRefund(consumer.refundTx.toObject());
    }).should.throw();
  });

  it('has no false positive on payment validation', function() {
    var provider = getProvider();
    var consumer = getValidatedConsumer().consumer;

    var payment = consumer.incrementPaymentBy(1000);
    payment.transaction.nLockTime = 1;

    (function() {
      provider.validPayment(payment);
    }).should.throw();
  });

});

var providerKey = new bitcore.PrivateKey('58e78db594be551a8f4c7070fd8695363992bd1eb37d01cd4a4da608f3dc5c2d', bitcore.Networks.testnet);
var fundingKey = new bitcore.PrivateKey('79b0630419ad72397d211db4988c98ffcb5955b14f6ec5c5651eec5c98d7e557', bitcore.Networks.testnet);
var commitmentKey = new bitcore.PrivateKey('17bc93ac93f4a26599d3af49e59206e8276259febba503434eacb871f9bbad75', bitcore.Networks.testnet);
var providerAddress = providerKey.toAddress(Networks.testnet);

var getConsumer = function() {

  var Consumer = require('../').Consumer;
  var refundAddress = 'mzCXqcsLBerwyoRZzBFQELHaJ1ZtBSxxe6';

  var consumer = new Consumer({
    network: 'testnet',
    fundingKey: fundingKey,
    commitmentKey: commitmentKey,
    providerPublicKey: providerKey.publicKey,
    providerAddress: providerKey.toAddress(),
    refundAddress: refundAddress
  });

  return {
    consumer: consumer,
    serverPublicKey: providerKey.publicKey,
    refundAddress: refundAddress
  };
};

var getFundedConsumer = function() {
  var result = getConsumer();
  result.consumer.processFunding([{
    'address': 'mq9uqc4W8phHXRPt3ZWUdRpoZ9rkR67Dw1',
    'txid': '787ef38932601aa6d22b844770121f713b0afb6c13fdd52e512c6165508f47cd',
    'vout': 1,
    'ts': 1416205164,
    'scriptPubKey': '76a91469b678f36c91bf635ff6e9479edd3253a5dfd41a88ac',
    'amount': 0.5,
    'confirmationsFromCache': false
  }, {
    'address': 'mq9uqc4W8phHXRPt3ZWUdRpoZ9rkR67Dw1',
    'txid': 'c1003b5e2c9f5eca65bde73463035e5dffcfbd3c234e55e069cfeebb513293e4',
    'vout': 0,
    'ts': 1416196853,
    'scriptPubKey': '76a91469b678f36c91bf635ff6e9479edd3253a5dfd41a88ac',
    'amount': 0.1,
    'confirmations': 18,
    'confirmationsFromCache': false
  }]);
  result.consumer.commitmentTx.sign(fundingKey);
  return result;
};

var getValidatedConsumer = function() {
  var funded = getFundedConsumer().consumer;
  funded.setupRefund();
  funded.refundTx.sign(providerKey);
  var refund = funded.refundTx.toObject();
  funded.validateRefund(refund);
  return {
    consumer: funded
  };
};

var getProvider = function() {
  var Provider = require('../').Provider;
  return new Provider({
    key: providerKey,
    paymentAddress: providerAddress,
    network: 'testnet'
  });
};
