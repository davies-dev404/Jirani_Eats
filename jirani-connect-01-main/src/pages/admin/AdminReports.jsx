import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";
import api from "../../api";

export default function AdminReports() {
  const reportTypes = [
    { id: "users", name: "User Growth", desc: "New registrations and active users." },
    { id: "donations", name: "Donation Impact", desc: "Total food rescued and distributed." },
    { id: "finance", name: "Financial Summary", desc: "Revenue, payouts, and fees." },
    { id: "deliveries", name: "Delivery Performance", desc: "Completion rates and delivery times." },
  ];

  const handleGenerateReport = async (type) => {
      try {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text("Jirani Eats Report", 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Report Type: ${type.name}`, 14, 32);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
        
        let head = [];
        let body = [];
        
        if (type.id === "users") {
            head = [['Name', 'Email', 'Role', 'Status', 'Joined']];
            try {
                // Fetch REAL users
                const { data } = await api.get("/users");
                if (Array.isArray(data) && data.length > 0) {
                    body = data.map(u => [
                        u.name || "N/A",
                        u.email || "N/A",
                        u.role || "N/A",
                        u.status || "Pending",
                        new Date(u.createdAt).toLocaleDateString()
                    ]);
                } else {
                    body = [['--', 'No users found', '--', '--', '--']];
                }
            } catch (err) {
                console.error("Error fetching users for report", err);
                body = [['--', 'Error loading data', '--', '--', '--']];
            }
        } else if (type.id === "donations") {
            head = [['ID', 'Food Item', 'Donor', 'Weight (kg)', 'Status']];
            body = [
                ['--', 'No donations recorded', '--', '-', '--']
            ];
        } else if (type.id === "finance") {
            head = [['ID', 'Transaction', 'Amount (KES)', 'Type', 'Date']];
            body = [
                ['--', 'No transactions recorded', '0', '--', '--']
            ];
        } else {
             head = [['ID', 'Metric', 'Value', 'Notes']];
             body = [['--', 'Data not available', '--', '']];
        }
  
        doc.autoTable({
            startY: 45,
            head: head,
            body: body,
        });
  
        doc.save(`jirani_eats_${type.id}_report.pdf`);
        toast.success(`${type.name} generated successfully!`);
      } catch (error) {
        console.error("Report generation failed", error);
        toast.error("Failed to generate report");
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Reports</h1>
           <p className="text-gray-500">Generate and download data insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {reportTypes.map((report) => (
               <Card key={report.id}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-medium">{report.name}</CardTitle>
                            <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <CardDescription>{report.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500">Time Period</label>
                                <Select defaultValue="month">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="week">This Week</SelectItem>
                                        <SelectItem value="month">This Month</SelectItem>
                                        <SelectItem value="year">This Year</SelectItem>
                                        <SelectItem value="all">All Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500">Format</label>
                                <Select defaultValue="pdf">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="csv">CSV (Excel)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button 
                            className="w-full bg-slate-900 hover:bg-slate-800"
                            onClick={() => handleGenerateReport(report)}
                        >
                            <Download className="mr-2 h-4 w-4" /> Generate Report
                        </Button>
                    </CardContent>
               </Card>
           ))}
      </div>
    </div>
  );
}
