// =====================================================
// SUPABASE CONFIG
// FPB DUTY SYSTEM
// =====================================================


const SUPABASE_URL = "https://qoetisgoqcpdekxusbnu.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZXRpc2dvcWNwZGVreHVzYm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDQ3NjksImV4cCI6MjEwMTIyMDc2OX0.-HFGuRgwfobOZ3YOa-7RXYdRkykbnyzD_eGwJ_3m9uU";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


console.log(
    "SUPABASE CONNECTED"
);
