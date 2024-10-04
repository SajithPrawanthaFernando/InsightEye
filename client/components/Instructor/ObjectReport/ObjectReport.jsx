import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { db } from "../../../hooks/firebase"; // Update the path according to your project structure
import { collection, query, where, getDocs } from "firebase/firestore";
import { BarChart } from "react-native-chart-kit";
import moment from "moment";
import * as Print from "expo-print"; // Import for PDF generation
import * as Sharing from "expo-sharing"; // To share the PDF
import { captureRef } from "react-native-view-shot"; // For capturing the chart as image
import { ScrollView } from "react-native-gesture-handler"; // In case of longer content

const InteractionReportScreen = () => {
  const [dailyInteractions, setDailyInteractions] = useState([]);
  const [labels, setLabels] = useState([]);
  const [reportData, setReportData] = useState([]); // For storing data for PDF export
  const [totalCount, setTotalCount] = useState(0); // Store the total interaction count
  const chartRef = useRef(); // Ref for capturing chart image
  const [chartImageURI, setChartImageURI] = useState(null); // URI of the captured chart image

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
        let total = 0; // To calculate total interaction count

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
            total++; // Increment total interactions

            // Add each object data to the report rows
            reportRows.push({
              userId: doc.id, // Assuming `doc.id` is the user id
              objectName: data.objectName || "Unknown", // Assuming `description` is object name
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
        setTotalCount(total); // Set total count for the report
      } catch (error) {
        console.error("Error fetching daily interactions:", error);
      }
    };

    fetchDailyInteractions();
  }, []);

  // Function to capture the chart as an image
  const captureChart = async () => {
    try {
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 1,
      });
      console.log("Captured chart URI:", uri); // Log the URI
      setChartImageURI(uri);
      return uri;
    } catch (error) {
      console.error("Error capturing chart image:", error);
      return null;
    }
  };

  // Function to convert URI to Base64 format
  const convertURIToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]); // Get base64 string
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Function to export the report as a PDF file
  const exportReportAsPDF = async () => {
    try {
      if (reportData.length === 0) {
        Alert.alert("No Data", "No report data available to export.");
        return;
      }

      // Capture the chart image first
      const chartURI = await captureChart();

      // Create the HTML content for the PDF
      let htmlContent = `
       <h1 style="text-align: center; margin-top: 80px;margin-bottom: 40px;">Daily Object Detection Report</h1>
<h2 style="text-align: center; margin-bottom: 50px;"><strong>Total Interactions: ${totalCount}</strong></h2>
        <table style="width: 90%; border-collapse: collapse; margin-left: auto; margin-right: auto;" border="1">
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

      // Embed the chart image in the PDF if available
      if (chartURI) {
        const base64Image = await convertURIToBase64(chartURI);
        htmlContent += `
          <h2 style="text-align: center;margin-top: 80px">Interaction Chart</h2>
          <img src="data:image/png;base64,${base64Image}" style="width: 100%; height: auto;" />
        `;
      } else {
        htmlContent += `<p style="text-align: center; color: red;">Failed to capture the chart image.</p>`;
      }

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Daily Object Detection Interactions (Last 30 Days)
      </Text>
      <Text style={styles.subtitle}>Total Interactions: {totalCount}</Text>
      <View ref={chartRef} collapsable={false}>
        <BarChart
          data={{
            labels: labels.length > 0 ? labels : ["No Data"],
            datasets: [
              {
                data: dailyInteractions.length > 0 ? dailyInteractions : [0],
                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              },
            ],
          }}
          width={330} // from react-native
          height={400}
          yAxisLabel="" // No prefix for Y-axis
          yAxisSuffix="" // No suffix, just clean labels
          yAxisInterval={0.5} // Custom interval for decimals (this might be ignored in the default BarChart config)
          verticalLabelRotation={45} // Optional: Rotate X-axis labels if they overlap
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 1, // Show decimal places in Y-axis values
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
            barPercentage: 0.6, // Adjust bar width
            useShadowColorFromDataset: false,
          }}
          bezier // Smoothens the curve (optional)
          style={{
            marginVertical: 10,
            borderRadius: 16,
          }}
          fromZero={true} // Start Y-axis from zero
        />
      </View>
      <TouchableOpacity style={styles.btn} onPress={exportReportAsPDF}>
        <Text style={styles.btnText}>Generate PDF Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#000080",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: "#000080",
  },
  btn: {
    backgroundColor: "#000080", // Navy blue color
    paddingVertical: 15, // Vertical padding for height
    paddingHorizontal: 40, // Horizontal padding for width
    borderRadius: 10, // Rounded corners
    marginVertical: 20, // Margin between button and other elements
    marginTop: 30,
    alignItems: "center", // Center text horizontally
  },
  btnText: {
    color: "#fff", // White text color
    fontSize: 16, // Font size
    fontWeight: "bold", // Bold text
  },
});

export default InteractionReportScreen;
