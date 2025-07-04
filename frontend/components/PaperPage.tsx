import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Share,
  Image,
} from "react-native";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import PdfViewer from "./PdfViewer";
import { ResearchPaper } from "@/types/ResearchPaper";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export function PaperPage({
  paperContents,
  setCurrentPage,
}: {
  paperContents: ResearchPaper;
  setCurrentPage: (page: "search" | "detail") => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiStatus, setAIStatus] = useState<"idle" | "loading" | "error">(
    "idle"
  );
  const [crewResponses, setCrewResponses] = useState({
    summarizer: "",
    takeaway: "",
    citator: "",
  });

  const apiBaseURL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const fetchAIResponses = async () => {
      const apiBaseURL = process.env.EXPO_PUBLIC_BACKEND_URL;
      await fetch(`${apiBaseURL}/v1/crew/run`, {
        method: "POST",
        body: JSON.stringify({
          paper_content: paperContents.abstract,
          authors: paperContents.authors
            .map((author) => author.name)
            .toString(),
          title: paperContents.title,
          journal: "",
          year: new Date(paperContents.publishedDate).getFullYear().toString(),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setCrewResponses({
            summarizer: data.summarizer_output,
            takeaway: data.takeaway_output,
            citator: data.citator_output,
          });
          setAIStatus("idle");
        })
        .catch((error) => {
          setAIStatus("error");
        });
    };
    setAIStatus("loading");
    fetchAIResponses();
  }, [paperContents]);
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const apiBaseURL = process.env.EXPO_PUBLIC_BACKEND_URL;
        const response = await fetch(
          `${apiBaseURL}/v1/paper/${paperContents.id}/photos`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("fetchPhotos response:", JSON.stringify(data));
          setPhotos(Array.isArray(data.photoUrls) ? data.photoUrls : []);
        } else {
          console.error("Fehler beim Laden der Fotos:", response.status);
          setPhotos([]);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Fotos:", error);
        setPhotos([]);
      }
    };
    fetchPhotos();
  }, [paperContents.id]);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      try {
        const formData = new FormData();
        const uniqueName = `photo_${Date.now()}.jpg`;

        formData.append("photo", {
          uri: localUri,
          name: uniqueName,
          type: "image/jpeg",
        } as any);

        const apiBaseURL = process.env.EXPO_PUBLIC_BACKEND_URL;
        const response = await fetch(
          `${apiBaseURL}/v1/upload-photo?paper_id=${encodeURIComponent(
            paperContents.id
          )}`,
          {
            method: "POST",
            body: formData,
          }
        );

        const responseText = await response.text();
        console.log("Upload response:", response.status, responseText);

        if (!response.ok) throw new Error("Upload failed");
        const data = JSON.parse(responseText);

        const uploadedPhotoUrl = `${apiBaseURL}${data.url}`;
        console.log("Uploaded photo URL:", uploadedPhotoUrl);

        setPhotos([uploadedPhotoUrl]);
      } catch (error) {
        console.error("Error uploading photo:", error);
        alert("Upload failed.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {isFullscreen ? (
        <View style={styles.fullscreenContainer}>
          <Pressable
            onPress={() => setIsFullscreen(false)}
            style={[styles.fullscreenBackButton, styles.backButtonCircle]}
          >
            <Text style={styles.backButtonIcon}>&#8592;</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              try {
                const result = await Share.share({
                  url: paperContents.downloadUrl,
                  title: paperContents.title,
                  message: `Check out this paper: ${paperContents.title}\n${paperContents.downloadUrl}`,
                });
                if (result.action === Share.sharedAction) {
                  if (result.activityType) {
                  } else {
                  }
                } else if (result.action === Share.dismissedAction) {
                }
              } catch (error) {
                console.log("Share failed:", error);
              }
            }}
            style={[styles.fullscreenShareButton, styles.backButtonCircle]}
          >
            <Entypo
              name="share"
              size={24}
              color="#fff"
              style={{ left: -1.5 }}
            />
          </Pressable>
          <PdfViewer
            source={{ uri: paperContents.downloadUrl }}
            style={{ flex: 1 }}
          />
        </View>
      ) : (
        <>
          <View style={styles.appTitleContainer}>
            <Text style={styles.appTitle}>pAIper</Text>
          </View>
          <Pressable
            onPress={() => {
              setCurrentPage("search");
            }}
          >
            <View style={styles.backButtonCircle}>
              <Text style={styles.backButtonIcon}>&#8592;</Text>
            </View>
          </Pressable>
          <View style={{ flex: 1 }}>
            {paperContents.title !== "" ? (
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[{ color: "#fff" }, styles.paperDate]}>
                  {new Date(paperContents.publishedDate).toLocaleDateString(
                    "de"
                  )}
                </Text>
                <Text style={styles.paperTitle}>{paperContents.title}</Text>
                <Text style={styles.paperAuthors}>
                  {paperContents.authors.length > 1
                    ? paperContents.authors
                        .map((author) => author.name)
                        .join(", ")
                    : paperContents.authors[0].name}
                </Text>
                {aiStatus === "loading" ? (
                  <View style={styles.aiContainer}>
                    <Text style={styles.aiCitator}>AI is thinking...</Text>
                  </View>
                ) : aiStatus === "error" ? (
                  <Text style={{ color: "#fff" }}>
                    There was an error generating ai responses
                  </Text>
                ) : (
                  <View style={styles.aiContainer}>
                    <View>
                      <Text style={{ color: "#fff" }}>Summary:</Text>
                      <Text style={styles.aiSummarizer}>
                        {crewResponses.summarizer}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ color: "#fff" }}>Takeaways:</Text>
                      <Text style={styles.aiTakeaway}>
                        {crewResponses.takeaway}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ color: "#fff" }}>Example Citation:</Text>
                      <Text style={styles.aiCitator}>
                        {crewResponses.citator}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={{
                    flex: 1,
                    backgroundColor: "#00000000",
                    width: "100%",
                    height: 450,
                    marginBottom: 128,
                    borderRadius: 8,
                    overflow: "hidden",
                    position: "relative"
                  }}>
                  <PdfViewer
                    source={{ uri: paperContents.downloadUrl }}
                    style={{ flex: 1 }}
                  />
                  <Pressable
                    onPress={() => setIsFullscreen(true)}
                    style={styles.fullscreenButton}
                  >
                    <MaterialIcons name="fullscreen" size={28} color="#fff" />
                  </Pressable>
                </View>
                {photos.length > 0 && photos[photos.length - 1] && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: photos[photos.length - 1].startsWith("http")
                          ? photos[photos.length - 1]
                          : `${apiBaseURL}${photos[photos.length - 1]}`,
                      }}
                      style={styles.mainImage}
                    />
                    <Pressable
                      style={styles.closeButton}
                      onPress={() => {
                        Alert.alert(
                          "Foto löschen",
                          "Möchtest du das Foto wirklich entfernen?",
                          [
                            { text: "Abbrechen", style: "cancel" },
                            {
                              text: "Löschen",
                              style: "destructive",
                              onPress: async () => {
                                try {
                                  const apiBaseURL = process.env.EXPO_PUBLIC_BACKEND_URL;
                                  const photoToDelete = photos[photos.length - 1];
                                  const relativePhotoUrl = new URL(photoToDelete, apiBaseURL).pathname;

                                  const response = await fetch(
                                    `${apiBaseURL}/v1/paper/${paperContents.id}/photos?photoUrl=${encodeURIComponent(relativePhotoUrl)}`,
                                    { method: "DELETE" }
                                  );

                                  if (!response.ok) {
                                    const errorText = await response.text();
                                    console.error("Backend-Löschfehler:", response.status, errorText);
                                    alert("Fehler beim Löschen des Fotos auf dem Server.");
                                    return;
                                  }

                                  setPhotos((prev) =>
                                    prev.filter((photo) => photo !== photoToDelete)
                                  );
                                } catch (error) {
                                  console.error("Fehler beim Löschen des Fotos:", error);
                                  alert("Fehler beim Löschen des Fotos.");
                                }
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <MaterialIcons name="close" size={24} color="#fff" />
                    </Pressable>
                  </View>
                )}

                <Pressable style={styles.photoButton} onPress={handleTakePhoto}>
                  <Text style={[styles.photoButtonText, { color: '#fff' }]}>
                    Notiz hinzufügen
                  </Text>
                </Pressable>
              </ScrollView>
            ) : (
              <Text>An error occured during the loading of this paper.</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#121212",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullscreenBackButton: {
    position: "absolute",
    top: 112,
    left: 18,
    zIndex: 1000,
  },
  fullscreenShareButton: {
    position: "absolute",
    top: 112,
    right: 18,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 80,
    paddingHorizontal: 32,
    backgroundColor: "#121212",
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold",
    width: "100%",
  },
  appTitleContainer: {
    marginBottom: 8,
  },
  searchBar: {
    color: "#fff",
    height: 48,
    borderColor: "#cfcfcf",
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  backButton: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 32,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#60AFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonIcon: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  shareButtonIcon: {
    color: "#fff",
    fontSize: 20,
  },
  paperTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  paperDate: {
    marginTop: 8,
  },
  paperAuthors: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 8,
  },
  searchStatus: {
    color: "#fff",
    fontSize: 16,
    marginTop: 32,
    textAlign: "center",
  },
  aiContainer: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    backgroundColor: "#60AFFF",
    gap: 16,
  },
  aiSummarizer: {
    color: "#fff",
    fontSize: 16,
  },
  aiTakeaway: {
    color: "#fff",
    fontSize: 16,
  },
  aiCitator: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  photoButton: {
    backgroundColor: "#60AFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -100,
    marginBottom: 100,
  },
  photoButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  fullscreenButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#60AFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  noteButtonText: {
    color: '#fff',
  },
  imageContainer: {
    width: "100%",
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: -100,
    marginBottom: 125,
    borderRadius: 12,
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",

    borderRadius: 12,
  },


  deleteNoteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#60AFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  closeButtonText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
 });
