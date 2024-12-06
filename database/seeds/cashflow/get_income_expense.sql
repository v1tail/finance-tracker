DROP FUNCTION IF EXISTS get_income_expense();

CREATE OR REPLACE FUNCTION get_income_expense()
RETURNS TABLE(
    dates TEXT,
    category TEXT,
    amount TEXT
) AS $$
BEGIN 
    RETURN QUERY
      WITH cat AS (
            SELECT 
                id,
                CASE 
                    WHEN category_name <> 'Income' THEN 'Expense'
                    ELSE 'Income'
                END AS names
            FROM expense_categories
        ), monthly_totals AS (
            SELECT 
                SUM(t.amount) AS total, 
                TO_CHAR(t.date, 'YYYY-MM') AS time,
                ec.names 
            FROM transactions t 
            JOIN cat ec ON ec.id = t.category_id 
            GROUP BY 2, 3
        ), monthly_income_expense AS (
            SELECT 
                time,
                MAX(CASE WHEN names = 'Income' THEN total ELSE 0 END) AS income,
                MAX(CASE WHEN names = 'Expense' THEN total ELSE 0 END) AS expense
            FROM monthly_totals
            GROUP BY time
        )
        SELECT 
            time as dates,
            'Income' AS category,
            income::text AS amount
        FROM monthly_income_expense
        UNION ALL
        SELECT 
            time as dates,
            'Expense' AS category,
            expense::text AS amount
        FROM monthly_income_expense
        UNION ALL
        SELECT 
            time as dates,
            'Savings' AS category,
            CASE WHEN (income=0) then '0' else ROUND( ( (income - expense)/income ) * 100, 2)::text END AS amount
        FROM monthly_income_expense
        ORDER BY dates, category;
END;
$$ LANGUAGE plpgsql;