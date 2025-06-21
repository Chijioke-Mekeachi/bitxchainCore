const handleBuyBlurt = async (amountStr) => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return showMessage("Invalid amount.", "error");

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) return showMessage("User not authenticated.", "error");

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('bbalance, balance')
      .eq('email', authUser.email)
      .single();

    if (fetchError) return showMessage("Failed to fetch balances.", "error");

    const currentBlurtBalance = parseFloat(user.bbalance);
    const currentNairaBalance = parseFloat(user.balance);
    if (currentNairaBalance < amt) return showMessage("Insufficient Naira balance.", "error");

    const rate = parseFloat(blurtRate);
    if (isNaN(rate) || rate <= 0) return showMessage("Invalid Blurt rate.", "error");

    const newNairaBalance = currentNairaBalance - amt;
    const newBlurtBalance = currentBlurtBalance + (amt/rate);

    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newNairaBalance, bbalance: newBlurtBalance })
      .eq('email', authUser.email);

    if (updateError) {
      showMessage("Failed to update balances.", "error");
    } else {
      setBlurtBalance(newBlurtBalance.toFixed(4));
      setNairaBalance(newNairaBalance.toFixed(2));
      setProfile(prev => prev ? { ...prev, bbalance: newBlurtBalance, balance: newNairaBalance } : null);
      showMessage('Sell successful!', 'success');
      setShowSellPopup(false);
      setRequestAmount("");
    }
  };

// remember to test this code before you use it
// this is the past you telling you this 
// so test it 
// not really sure what i did bu tit's fine 


//fetching bank names 
const [banks, setBanks] = useState([]);

  useEffect(() => {
    fetch("https://bitapi-0m8c.onrender.com/api/banks")
      .then((res) => res.json())
      .then(setBanks)
      .catch(console.error);
  }, []);

  // Auto-resolve account name when valid bank and 10-digit account number entered
  useEffect(() => {
    const selectedBank = banks.find(
      (bank) =>
        bank.name.toLowerCase() === withdrawBankName.toLowerCase() ||
        bank.code === withdrawBankName
    );

    if (selectedBank && withdrawAccountNumber.length === 10) {
      fetch(`https://bitapi-0m8c.onrender.com/api/resolve-account?account_number=${acc}&bank_code=${code}`)

        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            setWithdrawBankUsername(data.data.account_name);
          } else {
            setWithdrawBankUsername("Account not found");
          }
        })
        .catch(() => setWithdrawBankUsername("Lookup failed"));
    } else {
      setWithdrawBankUsername("");
    }
  }, [withdrawAccountNumber, withdrawBankName, banks]);