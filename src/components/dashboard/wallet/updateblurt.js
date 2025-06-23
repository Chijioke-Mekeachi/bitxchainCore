import { supabase } from "../../../lib/supabase";
import {}
export const updateBlurtBalance = async () => {
    if (!popupUsername) return showMessage("Please enter your Blurt username.", "error");

    setLoadingUpdate(true);
    try {
      const res = await fetch("https://rpc.blurt.world", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: ["condenser_api", "get_accounts", [[popupUsername]]],
          id: 1,
        }),
      });

      const json = await res.json();
      const account = json.result?.[0];
      if (!account) return showMessage("Blurt account not found.", "error");

      const balance = parseFloat(account.balance.split(" ")[0]);

      const { error } = await supabase
        .from("withdraw")
        .update({ bbalance: balance })
        .eq("email", profile.email);

      if (error) return showMessage("Failed to update balance.", "error");
      showMessage("Blurt balance updated!");
      await fetchUserProfile();
    } catch (error) {
      showMessage("Failed to fetch Blurt balance.", "error");
    }
    setShowPopup(false);
    setLoadingUpdate(false);
  };

  const handleWithdraw = async () => {
    if (
      !withdrawAmount ||
      !withdrawBankName ||
      !withdrawBankUsername ||
      !withdrawAccountNumber
    ) {
      return showMessage("Please fill all fields.", "error");
    }