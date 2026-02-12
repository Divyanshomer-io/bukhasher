
-- Add CHECK constraints for input validation

-- Orders: food_item must be non-empty and reasonable length
ALTER TABLE public.orders
ADD CONSTRAINT orders_food_item_length CHECK (length(trim(food_item)) > 0 AND length(food_item) <= 200);

-- Day payments: total_amount must be positive
ALTER TABLE public.day_payments
ADD CONSTRAINT day_payments_positive_amount CHECK (total_amount > 0);

-- Split details: amount must be positive  
ALTER TABLE public.split_details
ADD CONSTRAINT split_details_positive_amount CHECK (amount > 0);

-- Balances: no constraint needed on net_amount as it can be negative (representing debt direction)

-- Users: name must be non-empty and reasonable length
ALTER TABLE public.users
ADD CONSTRAINT users_name_length CHECK (length(trim(name)) > 0 AND length(name) <= 100);
