import React, {useState, useEffect} from 'react';
import {Box, TextField, Button, MenuItem, InputLabel, FormControl, Typography} from '@mui/material';
import {styled} from "@mui/system";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import {useTheme} from "@mui/material/styles";
import DashboardBox from '../../components/DashboardBox';
import BoxHeader from '../../components/BoxHeader';
import dayjs from "dayjs";

const FlexTopCenter = styled(Box)({
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    height: "100vh",
});

interface Category {
    type_name: string;
    category_id: number;
    id: number;
}

export default function ({records = []}: { records: any[] }) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetch(`${baseUrl}/feed/expense-categories`)
            .then(response => response.json())
            .then(data => {
                console.log('this is my data', data);
                setCategories(data);
            })
            .catch(error => console.error('Error fetching categories:', error));
    }, [baseUrl]);

    return <React.Fragment>
        {records.map(record =>
            <ItemForm key={record.id} record={record} categories={categories}/>)}
    </React.Fragment>
}

const ItemForm = ({record, categories}: { record: any, categories: Category[] }) => {
    const theme = useTheme();
    const isProfit = record.amount > 0;
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(isProfit ? 3 : null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(isProfit ? 1 : null);
    const [disabled, setDisabled] = useState(false);
    const [imported, setImported] = useState(false);
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (selectedTypeId === null || selectedCategoryId === null) {
            console.error('Type or category not selected');
            return;
        }

        const transactionData = {
            date: dayjs(record.time*1000).format('YYYY-MM-DD'),
            amount: Math.abs(record.amount / 100),
            typeId: selectedTypeId,
            categoryId: selectedCategoryId
        };

        fetch('http://localhost:8000/feed/transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData),
        })
            .then(response => response.json())
            .then(() => setImported(true))
            .catch(error => console.error('Error submitting transaction:', error));
    };
    const handleTypeChange = (event: SelectChangeEvent<number>) => {
        const id = parseInt(event.target.value as string);
        setSelectedTypeId(id);
        const category = categories.find(category => category.id === id);
        setSelectedCategoryId(category ? category.category_id : null);
    };


    return disabled ? null : (
        <DashboardBox p="1rem" overflow="hidden">
            <Box>
                <Typography variant="h6" sx={{ fontSize: '1rem', color: theme.palette.grey[500], textAlign: 'center' }}>{record.description}</Typography>
                <form onSubmit={handleSubmit} style={{display: 'grid', gap: 7, gridTemplateColumns: '1fr 1fr'}}>
                    <FormControl fullWidth sx={{
                        marginBottom: theme.spacing(2),
                    }}>
                        <TextField
                            type="number"
                            value={record.amount / 100}
                            variant="outlined"
                            label="Amount"
                            inputProps={{
                                style: {color: isProfit ? 'lightgreen' : 'mediumvioletred'}
                            }}
                            InputLabelProps={{
                                style: {color: theme.palette.grey[500]}
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: theme.palette.grey[400], // Color for the border
                                    },
                                    '&:hover fieldset': {
                                        borderColor: theme.palette.grey[500], // Color on hover
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: theme.palette.primary.main, // Color when focused
                                    },
                                },
                            }}
                        />
                    </FormControl>
                    <FormControl fullWidth sx={{
                        marginBottom: theme.spacing(2),
                    }}>
                        <InputLabel
                            sx={{color: theme.palette.grey[500]}}>Type</InputLabel> {/* Color for the label */}
                        <Select
                            value={selectedTypeId !== null ? selectedTypeId : ''}
                            onChange={handleTypeChange}
                            label="Type"
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.grey[400],
                                },
                                '.MuiSelect-select': {color: theme.palette.grey[600], textAlign: 'start'}, // Color for the select text
                                'svg': {color: theme.palette.grey[500]}, // Color for the dropdown icon
                            }}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>{category.type_name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {!imported && <Button variant="outlined" color="secondary" onClick={() => setDisabled(true)}>Delete Record</Button>}
                    {!imported && <Button type="submit" variant="contained" color="primary" disabled={!selectedTypeId}>Add Expense</Button>}
                    {imported && <Typography color='greenyellow'>Successfully Synced</Typography>}
                </form>
            </Box>
        </DashboardBox>
    )
}