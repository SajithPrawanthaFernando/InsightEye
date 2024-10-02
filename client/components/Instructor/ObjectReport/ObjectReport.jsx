import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { db } from "../../../hooks/firebase"; // Update the path according to your project structure
import { collection, query, where, getDocs } from "firebase/firestore";
import { BarChart } from "react-native-chart-kit";
import moment from "moment";
import * as Print from "expo-print"; // Import for PDF generation
import * as Sharing from "expo-sharing"; // To share the PDF

const InteractionReportScreen = () => {
  const [dailyInteractions, setDailyInteractions] = useState([]);
  const [labels, setLabels] = useState([]);
  const [reportData, setReportData] = useState([]); // For storing data for PDF export

  useEffect(() => {
    const fetchDailyInteractions = async () => {
      try {
        const last30Days = moment().subtract(30, "days").startOf("day");
        const today = moment().endOf("day");

        // Query Firestore for documents created in the last 30 days
        const q = query(
          collection(db, "objects"),
          where("createdAt", ">=", last30Days.toDate()),
          where("createdAt", "<=", today.toDate())
        );

        const snapshot = await getDocs(q);
        const interactionCount = {};
        const reportRows = []; // To store data for the report

        if (snapshot.empty) {
          console.log("No matching documents.");
          return; // Exit if no documents found
        }

        // Process the returned documents
        snapshot.forEach((doc) => {
          const data = doc.data();

          if (data.createdAt) {
            const date = moment(data.createdAt.toDate()).format("YYYY-MM-DD");
            if (interactionCount[date]) {
              interactionCount[date]++;
            } else {
              interactionCount[date] = 1;
            }

            // Add each object data to the report rows
            reportRows.push({
              userId: doc.id, // Assuming `doc.id` is the user id
              objectName: data.description || "Unknown", // Assuming `description` is object name
              date: moment(data.createdAt.toDate()).format("YYYY-MM-DD"),
            });
          }
        });

        // Only show the dates where interactions occurred
        const labels = Object.keys(interactionCount);
        const counts = Object.values(interactionCount);

        setLabels(labels);
        setDailyInteractions(counts);
        setReportData(reportRows); // Store report data
      } catch (error) {
        console.error("Error fetching daily interactions:", error);
      }
    };

    fetchDailyInteractions();
  }, []);

  // Function to export the report as a PDF file
  const exportReportAsPDF = async () => {
    try {
      if (reportData.length === 0) {
        Alert.alert("No Data", "No report data available to export.");
        return;
      }

      // Create the HTML content for the PDF
      let htmlContent = `
        <h1 style="text-align: center;">Daily Object Detection Report</h1>
        <table style="width: 80%; border-collapse: collapse;" border="1">
          <thead>
            <tr>
              <th style="padding: 10px;">User ID</th>
              <th style="padding: 10px;">Object Name</th>
              <th style="padding: 10px;">Date</th>
            </tr>
          </thead>
          <tbody>
      `;

      reportData.forEach((row) => {
        htmlContent += `
          <tr>
            <td style="padding: 10px;">${row.userId}</td>
            <td style="padding: 10px;">${row.objectName}</td>
            <td style="padding: 10px;">${row.date}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;

      // Create PDF from HTML content
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Share the PDF file
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      Alert.alert("Error", "Failed to generate PDF report.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Daily Object Detection Interactions (Last 30 Days)
      </Text>
      <BarChart
        data={{
          labels: labels.length > 0 ? labels : ["No Data"],
          datasets: [
            {
              data: dailyInteractions.length > 0 ? dailyInteractions : [0],
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Change color if needed
            },
          ],
        }}
        width={330} // from react-native
        height={240}
        yAxisLabel=""
        yAxisSuffix=" count"
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        style={{
          marginVertical: 10,
          borderRadius: 16,
        }}
        fromZero={true} // Start the Y-axis from zero
      />
      <Button title="Generate PDF Report" onPress={exportReportAsPDF} />
      {/* Button to generate PDF report */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000080",
  },
});

export default InteractionReportScreen;
