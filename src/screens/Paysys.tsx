import React, { useEffect } from "react";
import { Button, Text, TextInput, View, StyleSheet } from "react-native"

import { getAccount, Payment } from '../lib'



export const Paysys = () => {

  const account = getAccount()

  const [amount, onChangeNumber] = React.useState('0');
  const [destination, onChangeDest] = React.useState('2wY1UbwmS2ZqdiJbst74K1XJmCQGhoU2wyV6jGTuvAka');
  const [balance, setBalance] = React.useState('0')

  const handleAccountCreate = async () => {
    const acc_info = await account.createNewAccount('hello_world', '123456')
    console.log(acc_info)
  }

  const handleScan = () => {
    console.log('Scan QR Code')
  }

  const handleBalance = () => {
    account.getBalance().then(res => {
      setBalance(res.value.uiAmountString!)
    })
  }

  const handlePay = () => {
    const amt = BigInt(parseInt(amount) * 10 ** 9)
    const payment = new Payment({
      amount: amt,
      destination: destination,
      note: 'bayar soto haji mamat'
    })
    payment.pay('123456').then(() => {
      console.log('payment complete')
    }).catch(err => {
      console.log(err)
      console.log(err.stack)
    })
  }

  const handleLogin = () => {
    account.login('hello_world')
  }

  const handleLogout = () => {
    account.logout()
    console.log('logged_out')
  }

  const handleRecover = () => {
    console.log('handle recover')
  }


  return (
    <View style={styles.main}>
      <View>
        <Button 
          title="create account"
          onPress={handleAccountCreate}
          color="blue"
        />
      </View>
      <View>
        <Button 
          title="Get Balance"
          onPress={handleBalance}
          color="blue"
        />
      </View>
      <View>
        <Text style={{fontSize: 40}}>{balance} GIDR</Text>
      </View>

      <View style={{width: 200, justifyContent: 'center', alignItems: 'center', marginTop: 40}}>
        <Text>PAYMENT AMOUNT</Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeNumber}
          value={amount}
          placeholder="useless placeholder"
          keyboardType="numeric"
        />
      </View>
      <View>
        <Button
          title="Pay"
          onPress={handlePay}
        />
      </View>

      <View>
        <Button
          title="Login"
          onPress={handleLogin}
        />
      </View>

      <View>
        <Button
          title="Log out"
          onPress={handleLogout}
        />
      </View>

      <View>
        <Button
          title="Recover"
          onPress={handleRecover}
        />
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  main: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },


});