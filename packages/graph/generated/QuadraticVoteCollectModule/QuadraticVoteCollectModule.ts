// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class CollectWithVote extends ethereum.Event {
  get params(): CollectWithVote__Params {
    return new CollectWithVote__Params(this);
  }
}

export class CollectWithVote__Params {
  _event: CollectWithVote;

  constructor(event: CollectWithVote) {
    this._event = event;
  }

  get profileId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get pubId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get collector(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get currency(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class QuadraticVoteCollectModule__getPublicationDataResultValue0Struct extends ethereum.Tuple {
  get currency(): Address {
    return this[0].toAddress();
  }

  get recipient(): Address {
    return this[1].toAddress();
  }

  get referralFee(): i32 {
    return this[2].toI32();
  }

  get grantsRoundAddress(): Address {
    return this[3].toAddress();
  }

  get endTimestamp(): BigInt {
    return this[4].toBigInt();
  }
}

export class QuadraticVoteCollectModule extends ethereum.SmartContract {
  static bind(address: Address): QuadraticVoteCollectModule {
    return new QuadraticVoteCollectModule(
      "QuadraticVoteCollectModule",
      address
    );
  }

  HUB(): Address {
    let result = super.call("HUB", "HUB():(address)", []);

    return result[0].toAddress();
  }

  try_HUB(): ethereum.CallResult<Address> {
    let result = super.tryCall("HUB", "HUB():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  MODULE_GLOBALS(): Address {
    let result = super.call("MODULE_GLOBALS", "MODULE_GLOBALS():(address)", []);

    return result[0].toAddress();
  }

  try_MODULE_GLOBALS(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "MODULE_GLOBALS",
      "MODULE_GLOBALS():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getPublicationData(
    profileId: BigInt,
    pubId: BigInt
  ): QuadraticVoteCollectModule__getPublicationDataResultValue0Struct {
    let result = super.call(
      "getPublicationData",
      "getPublicationData(uint256,uint256):((address,address,uint16,address,uint256))",
      [
        ethereum.Value.fromUnsignedBigInt(profileId),
        ethereum.Value.fromUnsignedBigInt(pubId)
      ]
    );

    return changetype<
      QuadraticVoteCollectModule__getPublicationDataResultValue0Struct
    >(result[0].toTuple());
  }

  try_getPublicationData(
    profileId: BigInt,
    pubId: BigInt
  ): ethereum.CallResult<
    QuadraticVoteCollectModule__getPublicationDataResultValue0Struct
  > {
    let result = super.tryCall(
      "getPublicationData",
      "getPublicationData(uint256,uint256):((address,address,uint16,address,uint256))",
      [
        ethereum.Value.fromUnsignedBigInt(profileId),
        ethereum.Value.fromUnsignedBigInt(pubId)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      changetype<
        QuadraticVoteCollectModule__getPublicationDataResultValue0Struct
      >(value[0].toTuple())
    );
  }

  initializePublicationCollectModule(
    profileId: BigInt,
    pubId: BigInt,
    data: Bytes
  ): Bytes {
    let result = super.call(
      "initializePublicationCollectModule",
      "initializePublicationCollectModule(uint256,uint256,bytes):(bytes)",
      [
        ethereum.Value.fromUnsignedBigInt(profileId),
        ethereum.Value.fromUnsignedBigInt(pubId),
        ethereum.Value.fromBytes(data)
      ]
    );

    return result[0].toBytes();
  }

  try_initializePublicationCollectModule(
    profileId: BigInt,
    pubId: BigInt,
    data: Bytes
  ): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "initializePublicationCollectModule",
      "initializePublicationCollectModule(uint256,uint256,bytes):(bytes)",
      [
        ethereum.Value.fromUnsignedBigInt(profileId),
        ethereum.Value.fromUnsignedBigInt(pubId),
        ethereum.Value.fromBytes(data)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _lensHub(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _moduleGlobals(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class InitializePublicationCollectModuleCall extends ethereum.Call {
  get inputs(): InitializePublicationCollectModuleCall__Inputs {
    return new InitializePublicationCollectModuleCall__Inputs(this);
  }

  get outputs(): InitializePublicationCollectModuleCall__Outputs {
    return new InitializePublicationCollectModuleCall__Outputs(this);
  }
}

export class InitializePublicationCollectModuleCall__Inputs {
  _call: InitializePublicationCollectModuleCall;

  constructor(call: InitializePublicationCollectModuleCall) {
    this._call = call;
  }

  get profileId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get pubId(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get data(): Bytes {
    return this._call.inputValues[2].value.toBytes();
  }
}

export class InitializePublicationCollectModuleCall__Outputs {
  _call: InitializePublicationCollectModuleCall;

  constructor(call: InitializePublicationCollectModuleCall) {
    this._call = call;
  }

  get value0(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}

export class ProcessCollectCall extends ethereum.Call {
  get inputs(): ProcessCollectCall__Inputs {
    return new ProcessCollectCall__Inputs(this);
  }

  get outputs(): ProcessCollectCall__Outputs {
    return new ProcessCollectCall__Outputs(this);
  }
}

export class ProcessCollectCall__Inputs {
  _call: ProcessCollectCall;

  constructor(call: ProcessCollectCall) {
    this._call = call;
  }

  get referrerProfileId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get collector(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get profileId(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get pubId(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }

  get data(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }
}

export class ProcessCollectCall__Outputs {
  _call: ProcessCollectCall;

  constructor(call: ProcessCollectCall) {
    this._call = call;
  }
}
