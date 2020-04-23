# kyp


# Environment

Cloud Service: GCP(Google Cloud Platform)

OS: ubuntu 16.04

Machine type: n1-standard-4 (4 vCPUs, 15 GB memory)

Disk size: 30GB

Open Port: 80, 443, 3000*, 5984*, 8090* (*only during developing)


# How to use

Access to VM instance with ssh

## Install libraries
```
curl -O https://hyperledger.github.io/composer/v0.19/prereqs-ubuntu.sh
chmod u+x ./prereqs-ubuntu.sh
./prereqs-ubuntu.sh
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 1.4.6
```

*Reboot instanse

```
cd fabric-samples/fabcar
./startFabric.sh
```

## chaincode
```
cd fablic-first/chaincode
git clone https://github.com/andresponton21/chaincode_dapp2.git
```
Enter into a docker instance
```
docker exec -it cli bash
```

* New(first time)
```
peer chaincode install -l node -n kyp -v 0.1.1 -p /opt/gopath/src/github.com/chaincode/chaincode_dapp2/kyp/javascript/
peer chaincode instantiate -o orderer.example.com:7050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n record -v 0.1.1 -l node -c '{"Args":["initLedger"]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
```

* Upgrade

Please count up version number
```
peer chaincode install -l node -n kyp -v 0.1.2 -p /opt/gopath/src/github.com/chaincode/chaincode_dapp2/kyp/javascript/
peer chaincode upgrade -n kyp -v 0.1.2 --tls true -C mychannel -o orderer.example.com:7050 -c '{"Args":["initLedger"]}' --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -P "OR ('Org1MSP.member','Org2MSP.member')"
```
Exit from the docker instance
```



