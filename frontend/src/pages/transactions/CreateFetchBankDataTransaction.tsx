import React, {useState, useEffect} from 'react';
import {Box, TextField, Button, MenuItem, InputLabel, FormControl, Typography} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, {Dayjs} from 'dayjs';
import {useTheme} from '@mui/material/styles'
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {styled} from '@mui/system';
import DashboardBox from "../../components/DashboardBox";
import BoxHeader from "../../components/BoxHeader";
import BankTransactionList from './BankTransactionList';

interface Category {
    type_name: string;
    category_id: number;
    id: number; // Unique identifier for each type
}

// New styled component for top center alignment
const FlexTopCenter = styled(Box)({
    display: "flex",
    flexDirection: 'column',
    gap: 20,
    justifyContent: "flex-start",
    alignItems: "center"
});

const BANK_API_KEY = 'u8T1jeKzzJrLSR76VJs2of0HAQzUimlQt4hDoigFWcFM';

export default function () {
    const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
    const theme = useTheme();
    const [pickedDate, setPickedDate] = React.useState<Dayjs | null>(dayjs());
    const [bankRecordsData, setBankRecordsData] = React.useState([]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setBankRecordsData([]);

        fetch(`https://api.monobank.ua/personal/statement/14-OgBvAu-ReFKSiie9BwA/${pickedDate?.startOf('day').unix()}/${pickedDate?.endOf('day').unix()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': 'u8T1jeKzzJrLSR76VJs2of0HAQzUimlQt4hDoigFWcFM'
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setBankRecordsData(data)
                }
            })
            .catch(error => console.error('Error submitting transaction:', error));
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FlexTopCenter>
                <DashboardBox p="1rem" overflow="hidden">
                    <BoxHeader title="Transactions" subtitle="Add expenses" sideText=""/>
                    <Box>
                        <Box sx={{
                            padding: theme.spacing(3),
                            backgroundColor: theme.palette.background.default,
                            borderRadius: theme.shape.borderRadius,
                            boxShadow: theme.shadows[1],
                            border: '2px solid lightgray',
                            textAlign: 'center',
                            margin: theme.spacing(5,),
                            maxWidth: 600
                        }}>
                            <Typography variant="h3" sx={{marginBottom: theme.spacing(2)}}>Import</Typography>
                            <form onSubmit={handleSubmit}>
                                <FormControl fullWidth sx={{
                                    marginBottom: theme.spacing(2),
                                }}>
                                    <DatePicker<Dayjs>
                                        label="Choose date to fetch records for"
                                        value={pickedDate as any}
                                        onChange={(newValue) => setPickedDate(newValue)}
                                    />
                                </FormControl>
                                <Button type="submit" variant="contained" color="primary">Fetch</Button>
                            </form>
                        </Box>
                    </Box>
                </DashboardBox>
                <BankTransactionList records={bankRecordsData}/>
            </FlexTopCenter>
        </LocalizationProvider>
    );
};
