/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyContract extends Contract {

  /**
   * 
   * addMember 
   * 
   * When a member to the blockchain - can be either grower, shipper, trader, or retailer.
   * @param id - the unique id to identify the member
   * @param organization - what organization is the member part of
   * @param address - address of org
   * @param memberType - can be grower, shipper, trader and retailer
   */

  async addMember(ctx, id, organization, address, memberType) {
    console.info('addMember invoked');

    //create object to hold details of our new member
    let newMember = {};

    newMember.id = id;
    newMember.organization = organization;
    newMember.address = address;
    newMember.memberType = memberType;

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(newMember)));

  }

  /**
   * 
   * pourCup
   * 
   * Transaction used when pouring a cup of coffee at the event. Will
   * record who poured it, what time, what type of coffee, etc.
   * Users then can use this cupId later to get more details from the
   * blockchain about their beverage
   * @param cupId - the Id of the cup of coffee to be poured
   */
  async pourCup(ctx, cupId) {
    console.info('pourCup called');
    if (cupId.length <= 0) {
      throw new Error('Please enter the batchId');
    }

    let cupCoffee = {};
    cupCoffee.cupId = cupId;

    //get the first character of the cupId - this represents drink type
    let drinkType = cupId.charAt(0);
    if (drinkType.toLowerCase() === 'c') {
      cupCoffee.drinkType = 'Iced';
    } else if (drinkType.toLowerCase() === 'e') {
      cupCoffee.drinkType = 'Hot';
    } else {
      cupCoffee.drinkType = 'Nitro';
    }

    //get the 2nd character of cupId - this represents the barista which poured the cup
    let barista = cupId.charAt(1);
    if (barista.toLowerCase === 'j') {
      cupCoffee.barista = 'Josh';
    } else {
      cupCoffee.barista = 'Siv';
    }

    //get the 3nd character of cupId - this represents the co-op
    let coop = cupId.charAt(2);
    if (coop.toLowerCase() === 'b') {
      cupCoffee.beanType = 'Ethiopian Natural Yirgacheffe';
    }

    let dateStr = new Date();
    dateStr = dateStr.toString();
    cupCoffee.lastPour = dateStr;

    let count = 1
    cupCoffee.count = count;

    await ctx.stub.putState(cupId, Buffer.from(JSON.stringify(cupCoffee)));

  }

  /**
   * 
   * addCoffee 
   * 
   * When a grower adds a batch of coffee to the blockchain.
   * This creates the coffee asset on the blockchain.
   * @param size - size of coffee (small, medium, large)
   * @param roast - roast of coffee (light, medium, dark)
   * @param batchState - state of coffee (READY_FOR_DISTRIBUTION, 
   * REGULATION_TEST_PASSED, IMPORTED, READY_FOR_SALE)
   * @param growerId - the Id of the grower who will be associated with this batch
   */

  async addCoffee(ctx, size, roast, growerId) {
    console.info('addCoffee invoked');

    //TODO: 
    //do check to make sure the grower exists in the blockchain

    let batchCoffee = {};
    // generate random batchId from Math.random function
    batchCoffee.batchId = Math.random().toString(36).substring(3);
    batchCoffee.size = size;
    batchCoffee.roast = roast;
    batchCoffee.batchState = 'READY_FOR_DISTRIBUTION';
    batchCoffee.owner = growerId;

    await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batchCoffee)));

  }

  /**
   * 
   * submitFairTradeData
   * 
   * A transaction which adds fair trade data about our coffee batch.
   * @param batchId - the batch of coffee which is produced according to fair-trade standards
   * @param reportName - name of report 
   * @param orgDescription - description of fair trade coffee producer  
   * @param reportYear - year the report was written
   * @param fairTradePremiumInvested - totat amount invested in fair trade
   * 
   * // 3 different investments, each with a different amount
   * @param investmentTitle1
   * @param investmentAmount1
   * @param investmentTitle2 
   * @param investmentAmount2 
   * @param investmentTitle3
   * @param investmentAmount3
   */

  async submitFairTradeData(ctx, batchId, reportName, orgDescription, reportYear, fairTradePremiumInvested,
    investmentTitle1, investmentAmount1, investmentTitle2, investmentAmount2, investmentTitle3, investmentAmount3) {
    
      console.info('submit fair trade data invoked');

    //TODO: do if (batch exists) check

    //get batch identified bby batchId from the ledger
    let coffeeAsBytes = await ctx.stub.getState(batchId);
    let batchCoffee = JSON.parse(coffeeAsBytes);

    console.info('batchCoffee: ');
    console.info(batchCoffee);

    //update our batch of coffee with the shipping details and a owner (the trader)
    batchCoffee.reportName = reportName;
    batchCoffee.orgDescription = orgDescription;
    batchCoffee.reportYear = reportYear;
    batchCoffee.fairTradePremiumInvested = fairTradePremiumInvested;
    batchCoffee.investmentTitle1 = investmentTitle1;
    batchCoffee.investmentAmount1 = investmentAmount1;
    batchCoffee.investmentTitle2 = investmentTitle2;
    batchCoffee.investmentAmount2 = investmentAmount2;
    batchCoffee.investmentTitle3 = investmentTitle3;
    batchCoffee.investmentAmount3 = investmentAmount3;
    batchCoffee.batchState = 'CERTIFIED_FAIR_TRADE';

    //update the ledger with the new shipping + owner details
    await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batchCoffee)));

  }

  /**
   * 
   * submitPackingList
   * 
   * A transaction which adds shipping details from the packing list to the blockchain.
   * @param batchId - the batch we are shipping
   * @param growerId - Id of the grower which handed over beans to trader
   * @param shipperId - Id of the shipper which handed over beans to trader
   * @param issueDate - the date the package was shipped 
   * @param ICO_Num - ICO_number from the packing list
   * @param ICO_Lot - Lot where the shipment will start the journey from
   * @param FDA_Num - FDA number associated with this batch of beans 
   * @param invoiceNum - packing list invoice number
   * @param billofLadingNum - receipt of freight services
   * @param vesselName - name of the vessel
   * @param vesselVoyageNum number associated with vessel
   * @param containerNum - container which holds our shipment
   * @param sealNum - seal associated with our packing list
   * @param timestamp - when the transaction was submitted to the blockchain
   */

  async submitPackingList(ctx, batchId, shipperId, growerId, issueDate, ICO_Num, ICO_Lot, FDA_Num,
    invoiceNum, billofLadingNum, vesselName, vesselVoyageNum, containerNum, sealNum, timestamp) {
    console.info('submit packing list invoked');

    //TODO: do if (batch exists) check

    //get batch identified bby batchId from the ledger
    let coffeeAsBytes = await ctx.stub.getState(batchId);
    let batchCoffee = JSON.parse(coffeeAsBytes);

    console.info('batchCoffee: ');
    console.info(batchCoffee);

    //update our batch of coffee with the shipping details
    batchCoffee.growerId = growerId;
    batchCoffee.shipperId = shipperId;
    batchCoffee.issueDate = issueDate;
    batchCoffee.ICO_Num = ICO_Num;
    batchCoffee.ICO_Lot = ICO_Lot;
    batchCoffee.FDA_Num = FDA_Num;
    batchCoffee.invoiceNum = invoiceNum;
    batchCoffee.billofLadingNum = billofLadingNum;
    batchCoffee.vesselName = vesselName;
    batchCoffee.vesselVoyageNum = vesselVoyageNum;
    batchCoffee.containerNum = containerNum;
    batchCoffee.sealNum = sealNum;
    batchCoffee.timestamp = timestamp;
    batchCoffee.batchState = 'IMPORTED';
    batchCoffee.owner = traderId;

    //update the ledger with the new shipping + owner details
    await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batchCoffee)));

  }

  /**
   * submitWeightTally
   * 
   * A transaction which details from the packing list to the blockchain.
   * @param shipperId - Id of the shipper which is now in charge of shipping beans\
   * @param traderId - Id of the trader which is now in charge of shipping beans
   * @param batchId - the batch that is being checked
   * @param dateStripped - date when shipment is inspected
   * @param marks - if the shipment is has visible signs of damage  
   * @param bagsExpected - number of bags expected in the shipment
   * @param condition - bad, fair, good, excellent
   * @param insectActivity - yes,no
   *  
   */

  async submitWeightTally(ctx, traderId, shipperId, dateStripped, marks, bagsExpected, condition,
    insectActivity) {
    console.info('submit weight tally invoked');

    //TODO: do if (batch exists) check

    //get batch identified bby batchId from the ledger
    let coffeeAsBytes = await ctx.stub.getState(batchId);
    let batchCoffee = JSON.parse(coffeeAsBytes);

    console.info('batchCoffee: ');
    console.info(batchCoffee);

    //update our batch of coffee with the shipping details and a owner (the trader)
    batchCoffee.dateStripped = dateStripped;
    batchCoffee.marks = marks;
    batchCoffee.bagsExpected = bagsExpected;
    batchCoffee.condition = condition;
    batchCoffee.insectActivity = insectActivity;
    batchCoffee.batchState = 'READY_FOR_DISTRIBUTION';
    batchCoffee.owner = traderId;

    //update the ledger with the new shipping + owner details
    await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batchCoffee)));

  }

  /**
   * submitCupping
   * 
   * A transaction which adds details of the cupping process to the blockchain.
   * @param batchId - the batch that is being checked
   * @param traderId - Id of the trader which is now in charge of selling beans to retailer
   * @param retailerId - Id of the retailer which is now in charge of cupping
   * @param dateCupped - date when cupping details were submitted
   * @param cupper - the barista in charge of critiquing the batch of coffee
   * @param aroma - the overall smell of the beans  
   * @param flavor - taste and smell of the beans
   * @param afterTaste - the taste of the coffee after drinking it. 
   * @param acidity - how acidic is the coffee? 
   * @param body - how does the coffee feel? Describes how the coffee feels. Light, heavy, smooth. 
   * @param finalScore - The average of all the scores (body + acidity + aftertaste, etc.) 
   * 
   */

  async submitCupping(ctx, batchId, traderId, retailerId, dateCupped, cupper, aroma, flavor,
    afterTaste, acidity, body, finalScore) {

    console.info('submitCupping invoked');

    //TODO: do if (batch exists) check

    //get batch identified bby batchId from the ledger
    let coffeeAsBytes = await ctx.stub.getState(batchId);
    let batchCoffee = JSON.parse(coffeeAsBytes);

    console.info('batchCoffee: ');
    console.info(batchCoffee);

    //update our batch of coffee with the shipping details and a owner (the trader)
    batchCoffee.traderId = traderId;
    batchCoffee.retailerId = retailerId;
    batchCoffee.dateCupped = dateCupped;
    batchCoffee.cupper = cupper;
    batchCoffee.aroma = aroma;
    batchCoffee.flavor = flavor;
    batchCoffee.afterTaste = afterTaste;
    batchCoffee.acidity = acidity;
    batchCoffee.body = body;
    batchCoffee.finalScore = finalScore;
    
    //update the ledger with the new shipping + owner details
    await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batchCoffee)));

  }

  async query(ctx, key){
    console.info('query by key ' + key);
    let returnAsBytes = await ctx.stub.getState(key);
    let result = JSON.parse(returnAsBytes);
    return JSON.stringify(result);
  }

}

module.exports = MyContract;