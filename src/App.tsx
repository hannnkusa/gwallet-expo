import React, {useRef} from 'react';
import {SafeAreaView, ScrollView, StatusBar} from 'react-native';
import {Header} from './components';
import {AccountProvider, ConnectionProvider} from './providers';
import {Paysys, Wallet} from './screens';

global.Buffer = global.Buffer || require('buffer').Buffer

export const App = () => {
  const scrollViewRef = useRef<null | ScrollView>(null);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Header />
      <SafeAreaView>
        {/* <ScrollView
          ref={ref => (scrollViewRef.current = ref)}
          contentInsetAdjustmentBehavior="automatic">
          <AccountProvider>
            <ConnectionProvider>
              <Wallet />
            </ConnectionProvider>
          </AccountProvider>
        </ScrollView> */}

        <Paysys></Paysys>
      </SafeAreaView>
    </>
  );
};

export default App;
