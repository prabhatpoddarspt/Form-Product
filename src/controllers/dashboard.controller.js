import { asyncHandler } from "../util/asyncHandler.js";
import { ApiResponse } from "../util/ApiResponse.js";
import Form from "../models/form.model.js";
import Notification from "../models/notification.model.js";
import Request from "../models/request.model.js";
import ExcelJS from 'exceljs';


// Controller to get total form statistics (total forms, completed, and pending)
const getFormStatistics = asyncHandler(async (req, res) => {
    const today = new Date();
    // Set the time to midnight to get today's date range (00:00:00)
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    // Set the time to 23:59:59 to get today's date range (23:59:59)
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Count total forms
    const totalForms = await Form.countDocuments();

    // Count completed forms
    const completedForms = await Form.countDocuments({ status: 'Approved' });

    // Count pending forms
    const pendingForms = await Form.countDocuments({ status: 'Pending' });

    // Count today's forms
    const todayForms = await Form.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    return res.status(200).json(
        new ApiResponse(200, {
            totalForms,
            completedForms,
            pendingForms,
            todayForms, // Today's requests count
        }, "Dashboard statistics fetched successfully")
    );
});

// Controller to get data for Bar Chart (total, completed, and pending forms over time)
const getFormBarChartData = asyncHandler(async (req, res) => {
    const { period = 'monthly' } = req.query; // 'weekly', 'monthly', 'yearly'
    let startDate;
    let endDate = new Date();

    // Set the date range based on the selected period (weekly, monthly, yearly)
    switch (period) {
        case 'weekly':
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 7); // 7 days ago
            break;
        case 'monthly':
            startDate = new Date();
            startDate.setMonth(endDate.getMonth() - 12); // 12 months ago
            startDate.setDate(1); // Start from the first day of the month
            break;
        case 'yearly':
            startDate = new Date();
            startDate.setFullYear(endDate.getFullYear() - 5); // Last 5 years
            break;
        default:
            startDate = new Date(); // Default to daily if no valid period
            break;
    }

    // Define the aggregation pipeline based on the selected period
    let groupBy;
    let format;
    if (period === 'weekly') {
        groupBy = {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        }; // Group by "YYYY-MM-DD"
        format = []; // We will generate the exact 7 days dynamically
        for (let i = 0; i <= 6; i++) {
            const day = new Date();
            day.setDate(endDate.getDate() - i);
            format.push(day.toISOString().slice(0, 10)); // Format as "YYYY-MM-DD"
        }
    } else if (period === 'monthly') {
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } }; // Group by "YYYY-MM"
        format = []; // This will be dynamically generated to include the last 12 months
        for (let i = 0; i < 12; i++) {
            const month = new Date();
            month.setMonth(endDate.getMonth() - i);
            format.push(month.toISOString().slice(0, 7)); // Format as "YYYY-MM"
        }
    } else if (period === 'yearly') {
        groupBy = { $year: "$createdAt" }; // Group by year
        format = []; // Years from 5 years ago till today
        for (let i = 0; i < 5; i++) {
            format.push(endDate.getFullYear() - i);
        }
    }

    // Aggregate the data based on the period
    const formStats = await Form.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
            }
        },
        {
            $group: {
                _id: groupBy, // Group by the chosen period (day, month, year)
                total: { $sum: 1 },
                pending: {
                    $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } // Count pending requests
                },
                completed: {
                    $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] } // Count completed requests
                }
            }
        },
        {
            $project: {
                _id: 0,
                label: "$_id", // Get the group label (e.g., day, month, or year)
                totalRequests: "$total",
                pendingRequests: "$pending",
                completedRequests: "$completed",
            }
        },
        {
            $sort: { label: 1 } // Sort by label (e.g., days, months, or years in order)
        }
    ]);

    // Prepare the result in the specified format
    const result = format.map((label) => {
        const stat = formStats.find((stat) => stat.label === label);
        let formattedStat = {
            totalRequests: 0,
            pendingRequests: 0,
            completedRequests: 0
        };

        if (stat) {
            formattedStat = {
                totalRequests: stat.totalRequests,
                pendingRequests: stat.pendingRequests,
                completedRequests: stat.completedRequests
            };
        }

        // Structure the result based on the period type
        if (period === 'weekly') {
            return {
                date: label,
                ...formattedStat
            };
        } else if (period === 'monthly') {
            return {
                month: label,
                ...formattedStat
            };
        } else if (period === 'yearly') {
            return {
                year: label,
                ...formattedStat
            };
        }
    });

    return res.status(200).json(
        new ApiResponse(200, result, `${period.charAt(0).toUpperCase() + period.slice(1)} bar chart data fetched successfully`)
    );
});


// Controller to get Pie Chart data based on regions
const getRegionPieChartData = asyncHandler(async (req, res) => {
    const { period = 'monthly' } = req.query; // 'weekly', 'monthly', 'yearly'

    // Set the date range based on the selected period (weekly, monthly, yearly)
    let startDate;
    let endDate = new Date();
    switch (period) {
        case 'weekly':
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 7); // 7 days ago
            break;
        case 'monthly':
            startDate = new Date();
            startDate.setMonth(endDate.getMonth() - 1); // 1 month ago
            break;
        case 'yearly':
            startDate = new Date();
            startDate.setFullYear(endDate.getFullYear() - 1); // 1 year ago
            break;
        default:
            startDate = new Date(); // Default to daily if no valid period
            break;
    }

    // Get the total number of forms in the specified date range
    const totalForms = await Form.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
    });

    // Group forms by region and count them within the date range
    const regionStats = await Form.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
            }
        },
        {
            $group: {
                _id: "$region", // Assuming the region is stored as `region` in the Form schema
                count: { $sum: 1 },
            }
        },
        {
            $project: {
                region: "$_id",
                count: 1,
                _id: 0,
            }
        }
    ]);

    // Define all regions
    const allRegions = ['North', 'East', 'South', 'West'];

    // Add missing regions with 0 data
    const regionStatsMap = regionStats.reduce((map, region) => {
        map[region.region] = region;
        return map;
    }, {});

    // Ensure all regions are present in the final data
    const finalRegionStats = allRegions.map(region => {
        const regionData = regionStatsMap[region] || { region, count: 0 };
        const percentage = totalForms ? ((regionData.count / totalForms) * 100).toFixed(2) : 0;
        return {
            region: regionData.region,
            count: regionData.count,
            percentage
        };
    });

    return res.status(200).json(
        new ApiResponse(200, finalRegionStats, "Region pie chart data with percentages fetched successfully")
    );
});


// Get all notifications and mark them as read
const getAllNotifications = asyncHandler(async (req, res) => {


    // Get all notifications (now all will be marked as read)
    const notifications = await Notification.find().limit(20).sort({ createdAt: -1 });

    // Mark all notifications as read
    await Notification.updateMany(
        { status: false }, // Only target unread notifications
        { status: true } // Mark them as read
    );

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications fetched and marked as read successfully")
    );


})

const getCharts = asyncHandler(async (req, res) => {
    const { region } = req.query; // Get region from the query params

    // Fetch all the pending requests from the database (no region filter applied here)
    const charts = await Request.find({ status: "Pending" })
        .select("pendingPosition region createdAt")
        .lean(); // Use lean() for better performance when reading

    // Helper function to calculate the number of days pending
    const calculateDaysPending = (createdAt) => {
        const currentDate = new Date();
        const createdDate = new Date(createdAt);
        const differenceInTime = currentDate - createdDate;
        return Math.floor(differenceInTime / (1000 * 60 * 60 * 24)); // Convert to days
    };

    // Predefine the order of stages (pending positions)
    const stageOrder = ["Approval 1", "Approval 2", "SCM Desk","RM", "SCM Spoc","AMC Cancellation","Refund Payment"];

    // Initialize the result object
    const result = {};
    const regionCount = { North: 0, East: 0, South: 0, West: 0 };
    let totalPendingRequests = 0;

    charts.forEach((chart) => {
        const daysPending = calculateDaysPending(chart.createdAt);
        const { region, pendingPosition } = chart;
        const position = pendingPosition[0]; // Assuming only the first position is considered

        // Increment the region's total pending request count
        if (regionCount[region] !== undefined) {
            regionCount[region]++;
        }

        // Increment the total pending requests
        totalPendingRequests++;

        if (!result[region]) {
            result[region] = {};
        }

        if (!result[region][position]) {
            result[region][position] = {
                totalPending: 0,
                today: 0,
                "1 day": 0,
                "2 days": 0,
                "3 days": 0,
                "4 days": 0,
                "5 days": 0,
                ">5 days": 0,
            };
        }

        // Increment the total pending
        result[region][position].totalPending++;

        // Increment based on the days pending
        if (daysPending === 0) {
            result[region][position].today++;
        } else if (daysPending === 1) {
            result[region][position]["1 day"]++;
        } else if (daysPending === 2) {
            result[region][position]["2 days"]++;
        } else if (daysPending === 3) {
            result[region][position]["3 days"]++;
        } else if (daysPending === 4) {
            result[region][position]["4 days"]++;
        } else if (daysPending === 5) {
            result[region][position]["5 days"]++;
        } else {
            result[region][position][">5 days"]++;
        }
    });

    // If region is provided, filter the result based on the selected region
    if (region) {
        const filteredCharts = charts.filter(chart => chart.region === region);

        const formattedData = [];

        stageOrder.forEach((stage) => {
            // Ensure all stages have at least zero values even if no data was found
            const stageData = result[region] && result[region][stage]
                ? result[region][stage]
                : {
                    totalPending: 0,
                    today: 0,
                    "1 day": 0,
                    "2 days": 0,
                    "3 days": 0,
                    "4 days": 0,
                    "5 days": 0,
                    ">5 days": 0
                };

            formattedData.push({
                [stage]: stageData
            });
        });

        // Get total pending requests in the selected region
        const totalPendingInSelectedRegion = regionCount[region] || 0;

        return res.status(200).json(
            new ApiResponse(200, {
                formattedData, // The formatted chart data for the selected region
                totalPendingRequests, // Total pending requests across all regions
                totalPendingInSelectedRegion, // Pending requests in the selected region
                regionCount // Breakdown of pending requests by region
            }, "Chart fetched successfully")
        );
    }

    // If no region is provided, return the data in the original format for all regions
    return res.status(200).json(
        new ApiResponse(200, {
            result, // The original data for all regions
            totalPendingRequests, // Total pending requests across all regions
            regionCount // Breakdown of pending requests by region
        }, "Chart fetched successfully")
    );
});



const getExcelExport = asyncHandler(async (req, res) => {
    const charts = await Request.find({ status: "Pending" })
        .select("pendingPosition region createdAt")
        .lean();

    // Helper function to calculate the number of days pending
    const calculateDaysPending = (createdAt) => {
        const currentDate = new Date();
        const createdDate = new Date(createdAt);
        const differenceInTime = currentDate - createdDate;
        return Math.floor(differenceInTime / (1000 * 60 * 60 * 24)); // Convert to days
    };

    // Predefine the order of stages (pending positions)
    const stageOrder = ["Approval 1", "Approval 2", "SCM Desk","RM", "SCM Spoc","AMC Cancellation","Refund Payment"]

    // Initialize the result object for regions
    const result = {};

    charts.forEach((chart) => {
        const daysPending = calculateDaysPending(chart.createdAt);
        const { region, pendingPosition } = chart;
        const position = pendingPosition[0]; // Assuming only the first position is considered

        if (!result[region]) {
            result[region] = {};
        }

        if (!result[region][position]) {
            result[region][position] = {
                totalPending: 0,
                today: 0,
                "1 day": 0,
                "2 days": 0,
                "3 days": 0,
                "4 days": 0,
                "5 days": 0,
                ">5 days": 0,
            };
        }

        // Increment the total pending
        result[region][position].totalPending++;

        // Increment based on the days pending
        if (daysPending === 0) {
            result[region][position].today++;
        } else if (daysPending === 1) {
            result[region][position]["1 day"]++;
        } else if (daysPending === 2) {
            result[region][position]["2 days"]++;
        } else if (daysPending === 3) {
            result[region][position]["3 days"]++;
        } else if (daysPending === 4) {
            result[region][position]["4 days"]++;
        } else if (daysPending === 5) {
            result[region][position]["5 days"]++;
        } else {
            result[region][position][">5 days"]++;
        }
    });

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();

    // Define the header color gradient (from blue to red)
    const headerColors = [
        { header: "Stage", color: "FF1E90FF" }, // Blue
        { header: "Total Pending", color: "FF6495ED" },
        { header: "Today", color: "FFFFA500" },  // Orange
        { header: "1 Day", color: "FFFF4500" },  // Dark Orange
        { header: "2 Days", color: "FFFF6347" }, // Tomato
        { header: "3 Days", color: "FFFF7F50" }, // Coral
        { header: "4 Days", color: "FFFF6347" }, // Red
        { header: "5 Days", color: "FFFF0000" }, // Red
        { header: ">5 Days", color: "FFB22222" }, // Firebrick
    ];

    // Loop over each region to create a new sheet per region
    Object.keys(result).forEach((region) => {
        const worksheet = workbook.addWorksheet(region);

        // Add header row
        worksheet.columns = headerColors.map((item) => ({
            header: item.header,
            key: item.header.toLowerCase().replace(/\s/g, ""), // Use keys like "stage", "totalpending", etc.
            width: 15
        }));

        // Apply styling to header row
        const headerRow = worksheet.getRow(1);
        headerColors.forEach((item, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: item.color } // Apply the respective color
            };
            cell.font = {
                bold: true, // Make the header bold
                color: { argb: 'FFFFFFFF' }, // White text
            };
            cell.alignment = { horizontal: 'center' }; // Center-align the header
        });

        // Add data rows for each stage in the region
        stageOrder.forEach((stage) => {
            const data = result[region][stage] || {
                totalPending: 0,
                today: 0,
                "1 day": 0,
                "2 days": 0,
                "3 days": 0,
                "4 days": 0,
                "5 days": 0,
                ">5 days": 0,
            };

            worksheet.addRow({
                stage: stage,
                totalpending: data.totalPending,
                today: data.today,
                "1day": data["1 day"],
                "2days": data["2 days"],
                "3days": data["3 days"],
                "4days": data["4 days"],
                "5days": data["5 days"],
                ">5days": data[">5 days"],
            });
        });
    });

    // Generate the Excel file and send it as a download
    const fileName = `pending_requests_${Date.now()}.xlsx`;
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    // Write the workbook to the response
    await workbook.xlsx.write(res);

    // End the response
    res.end();
});




// Mark all notifications as read and get the total unread count
const getUnreadCount = asyncHandler(async (req, res) => {
    try {


        // Get the count of unread notifications (those with status false)
        const unreadCount = await Notification.countDocuments({ status: false });

        return res.status(200).json(
            new ApiResponse(200, { unreadCount }, "All notifications marked as read")
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, null, "Error marking notifications as read", error.message)
        );
    }
});



export { getFormStatistics, getFormBarChartData, getRegionPieChartData, getAllNotifications, getUnreadCount, getCharts ,getExcelExport};
