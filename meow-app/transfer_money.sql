-- Create a function to transfer money between accounts
-- This function handles the entire transfer atomically within a database transaction

CREATE OR REPLACE FUNCTION transfer_money(
  p_account_from_id INTEGER,
  p_account_to_id INTEGER,
  p_amount DECIMAL(10,2),
  p_message TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account_from RECORD;
  v_account_to RECORD;
  v_transaction_id INTEGER;
  v_result JSON;
BEGIN
  -- Validate inputs
  IF p_account_from_id IS NULL OR p_account_to_id IS NULL OR p_amount IS NULL THEN
    RETURN json_build_object('error', 'account_from_id, account_to_id, and amount are required');
  END IF;

  IF p_account_from_id = p_account_to_id THEN
    RETURN json_build_object('error', 'Cannot transfer to the same account');
  END IF;

  IF p_amount <= 0 THEN
    RETURN json_build_object('error', 'Amount must be positive');
  END IF;

  -- Get account information with row-level locking to prevent race conditions
  SELECT id, account_number, type, balance, customer_id INTO v_account_from
  FROM accounts 
  WHERE id = p_account_from_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Source account not found');
  END IF;

  SELECT id, account_number, type, balance, customer_id INTO v_account_to
  FROM accounts 
  WHERE id = p_account_to_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Destination account not found');
  END IF;

  -- Check sufficient balance
  IF v_account_from.balance < p_amount THEN
    RETURN json_build_object('error', 'Insufficient balance');
  END IF;

  -- Update account balances
  UPDATE accounts 
  SET balance = balance - p_amount 
  WHERE id = p_account_from_id;

  UPDATE accounts 
  SET balance = balance + p_amount 
  WHERE id = p_account_to_id;

  -- Record the transaction
  INSERT INTO transactions (account_from, account_to, amount, message)
  VALUES (p_account_from_id, p_account_to_id, p_amount, p_message)
  RETURNING id INTO v_transaction_id;

  -- Return success response with full account details
  SELECT json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'amount', p_amount,
    'account_from', json_build_object(
      'id', v_account_from.id,
      'account_number', v_account_from.account_number,
      'type', v_account_from.type,
      'balance', v_account_from.balance - p_amount,
      'customer_id', v_account_from.customer_id
    ),
    'account_to', json_build_object(
      'id', v_account_to.id,
      'account_number', v_account_to.account_number,
      'type', v_account_to.type,
      'balance', v_account_to.balance + p_amount,
      'customer_id', v_account_to.customer_id
    )
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback will happen automatically due to transaction
    RETURN json_build_object('error', 'Transaction failed: ' || SQLERRM);
END;
$$; 