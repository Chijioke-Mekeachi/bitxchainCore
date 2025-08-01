import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';

export default function WalletScreen() {
  const [profile, setProfile] = useState(null);
  const [blurtBalance, setBlurtBalance] = useState('0.0000');
  const [nairaBalance, setNairaBalance] = useState('0.00');
  const [blurtRate, setBlurtRate] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [transferUsername, setTransferUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchBlurtRate();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userEmail = session?.user?.email;
    if (!userEmail) return;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (data) {
      setProfile(data);
      setBlurtBalance(data.bbalance != null ? parseFloat(data.bbalance).toFixed(4) : '0.0000');
      setNairaBalance(data.balance != null ? parseFloat(data.balance).toFixed(2) : '0.00');
    }
  };

  const fetchBlurtRate = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=blurt&vs_currencies=ngn'
      );
      const data = await response.json();
      if (data?.blurt?.ngn != null) {
        setBlurtRate(data.blurt.ngn);
      }
    } catch (error) {
      console.error('Failed to fetch Blurt rate:', error);
    }
  };

  const handleBuyBlurt = async () => {
    if (!amount || isNaN(amount)) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const response = await fetch('https://bitapi-0m8c.onrender.com/api/buy-blurt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, amount: parseFloat(amount) }),
      });

      const result = await response.json();
      if (!response.ok) {
        Alert.alert('Error', result.error || 'Failed to buy Blurt');
        return;
      }

      Alert.alert('Success', 'Buy successful!');
      setShowBuyModal(false);
      setAmount('');
      fetchUserProfile();
    } catch (error) {
      Alert.alert('Error', 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSellBlurt = async () => {
    if (!amount || isNaN(amount)) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const response = await fetch('https://bitapi-0m8c.onrender.com/api/sell-blurt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, amount: parseFloat(amount) }),
      });

      const result = await response.json();
      if (!response.ok) {
        Alert.alert('Error', result.error || 'Failed to sell Blurt');
        return;
      }

      Alert.alert('Success', 'Sell successful!');
      setShowSellModal(false);
      setAmount('');
      fetchUserProfile();
    } catch (error) {
      Alert.alert('Error', 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#ffcc00" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>{profile.username}</Text>
          <Text style={styles.profileText}>Email: {profile.email}</Text>
          <Text style={styles.profileText}>Blurt Username: {profile.busername}</Text>
          <Text style={styles.profileText}>
            Memo: <Text style={styles.memo}>{profile.memo}</Text>
          </Text>
        </View>

        {/* Wallet Info */}
        <View style={styles.walletCard}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceAmount}>{blurtBalance} BLURT</Text>
              <Text style={styles.balanceRate}>
                1 BLURT ≈ ₦{blurtRate ? (blurtRate - blurtRate * 0.33).toFixed(2) : '...'}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceAmount}>₦{nairaBalance}</Text>
              <TouchableOpacity style={styles.withdrawButton}>
                <Text style={styles.withdrawButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Transfer Instructions */}
        <View style={styles.transferCard}>
          <Text style={styles.transferTitle}>Fund account via Transfer</Text>
          <Text style={styles.transferText}>
            <Text style={styles.bold}>Send BLURT to:</Text> bitxchain
          </Text>
          <Text style={styles.transferText}>
            <Text style={styles.bold}>Use Memo:</Text> {profile.memo}
          </Text>
          <TouchableOpacity style={styles.transferButton}>
            <Text style={styles.transferButtonText}>I have made a transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.blueButton]}
            onPress={() => setShowTransferModal(true)}
          >
            <Text style={styles.actionButtonText}>Transfer Blurt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.purpleButton]}
            onPress={() => setShowBuyModal(true)}
          >
            <Text style={styles.actionButtonText}>💱 Buy Blurt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.yellowButton]}
            onPress={() => setShowSellModal(true)}
          >
            <Text style={styles.actionButtonText}>💵 Sell Blurt</Text>
          </TouchableOpacity>
        </View>

        {/* Buy Modal */}
        <Modal
          visible={showBuyModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowBuyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>BUY BLURT</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount of blurt"
                placeholderTextColor="#ccc"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleBuyBlurt}
                  disabled={loading}
                >
                  <Text style={styles.modalButtonText}>
                    {loading ? 'Processing...' : 'Send Request'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowBuyModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Sell Modal */}
        <Modal
          visible={showSellModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSellModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>SELL BLURT</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount of blurt"
                placeholderTextColor="#ccc"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleSellBlurt}
                  disabled={loading}
                >
                  <Text style={styles.modalButtonText}>
                    {loading ? 'Processing...' : 'Send Request'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowSellModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Transfer Modal */}
        <Modal
          visible={showTransferModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTransferModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>TRANSFER BLURT</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Receiver Blurt Username"
                placeholderTextColor="#ccc"
                value={transferUsername}
                onChangeText={setTransferUsername}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Amount"
                placeholderTextColor="#ccc"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  disabled={loading}
                >
                  <Text style={styles.modalButtonText}>
                    {loading ? 'Sending...' : 'Send'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowTransferModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  profileText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  memo: {
    fontFamily: 'monospace',
    backgroundColor: '#333',
    padding: 2,
    borderRadius: 4,
  },
  walletCard: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcc00',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceItem: {
    flex: 1,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  balanceRate: {
    fontSize: 12,
    color: '#ccc',
  },
  withdrawButton: {
    backgroundColor: '#00ff99',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  withdrawButtonText: {
    color: '#121212',
    fontWeight: 'bold',
  },
  transferCard: {
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  transferTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  transferText: {
    color: '#ccc',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  transferButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#00f0ff',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  transferButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  blueButton: {
    backgroundColor: '#00f0ff',
  },
  purpleButton: {
    backgroundColor: '#aa00ff',
  },
  yellowButton: {
    backgroundColor: '#ffcc00',
  },
  actionButtonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1f1f1f',
    padding: 30,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#ffcc00',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00f0ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#555',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});