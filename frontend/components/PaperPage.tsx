import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import PdfViewer from "./PdfViewer";
import { ResearchPaper } from "@/types/ResearchPaper";

export function PaperPage({ paperContents, setCurrentPage }: { paperContents: ResearchPaper, setCurrentPage: (page: 'search' | 'detail') => void }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiStatus, setAIStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [crewResponses, setCrewResponses] = useState({
    'summarizer': '',
    'citator': '',
  });

  useEffect(() => {
    const fetchAIResponses = async () => {
      const apiBaseURL = process.env.EXPO_PUBLIC_BACKEND_URL;
      await fetch(`${apiBaseURL}/v1/crew/run`, {
        method: 'POST',
        body: JSON.stringify({
          "paper_content": paperContents.abstract,
          "authors": paperContents.authors.map(author => author.name).toString(),
          "title": paperContents.title,
          "journal": "",
          "year": new Date(paperContents.publishedDate).getFullYear().toString(),
        })
      })
      .then(response => response.json())
      .then(data => {
        setCrewResponses({
          'summarizer': data.summarizer_output,
          'citator': data.citator_output,
        });
        setAIStatus('idle');
      })
      .catch(error => {
        setAIStatus('error');
      });
    }
    setAIStatus('loading');
    fetchAIResponses();
  }, [paperContents])

  return (
    <View style={styles.container}>
      {isFullscreen ? (
        <View style={styles.fullscreenContainer}>
          <Pressable
            onPress={() => setIsFullscreen(false)}
            style={styles.fullscreenBackButton}
          >
            <Text style={styles.backButton}>Back</Text>
          </Pressable>
          <PdfViewer
            source={{ uri: paperContents.downloadUrl }}
            style={{ flex: 1 }}
          />
        </View>
      ) : (
        <>
          <Text style={styles.appTitle}>pAIper</Text>
          <Pressable onPress={() => {setCurrentPage('search')}}>
            <Text style={styles.backButton}>Back</Text>
          </Pressable>
          <View style={{flex: 1}}>
            {paperContents.title !== "" ? (
              <ScrollView style={{ flex: 1 }}>
                <Text style={{ color: '#fff' }}>{new Date(paperContents.publishedDate).toLocaleDateString('de')}</Text>
                <Text style={styles.paperTitle}>{paperContents.title}</Text>
                <Text style={styles.paperAuthors}>{paperContents.authors.length > 1 ? paperContents.authors.map(author => author.name).join(', ') : paperContents.authors[0].name}</Text>
                {aiStatus === 'loading' ? (
                  <View style={styles.aiContainer}>
                    <Text style={styles.aiCitator}>AI is thinking...</Text>
                  </View>
                ) : aiStatus === 'error' ? (
                  <Text style={{ color: '#fff' }}>There was an error generating ai responses</Text>
                ) : (
                  <View style={styles.aiContainer}>
                    <View>
                      <Text>Summary:</Text>
                      <Text style={styles.aiSummarizer}>{crewResponses.summarizer}</Text>
                    </View>
                    <View>
                      <Text>Example Citation:</Text>
                      <Text style={styles.aiCitator}>{crewResponses.citator}</Text>
                    </View>
                  </View>
                )}
                <PdfViewer
                  source={{ uri: paperContents.downloadUrl }}
                  style={{ flex: 1, backgroundColor: '#00000000', width: '100%', height: 450, marginBottom: 128 }}
                  webviewProps={{
                    onTouchStart: () => setIsFullscreen(true)
                  }}
                />
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
    backgroundColor: '#121212',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullscreenBackButton: {
    position: 'absolute',
    top: 32,
    left: 16,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 72,
    paddingHorizontal: 32,
    backgroundColor: '#121212',
  },
  appTitle: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
    width: '100%'
  },
  searchBar: {
    color: '#fff',
    height: 48,
    borderColor: '#cfcfcf',
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  paperTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paperAuthors: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 8,
  },
  searchStatus: {
    color: '#fff',
    fontSize: 16,
    marginTop: 32,
    textAlign: 'center',
  },
  aiContainer: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#91c5fa',
    padding: 16,
    marginVertical: 16,
    backgroundColor: '#60AFFF',
    gap: 16,
  },
  aiSummarizer: {
    color: '#000',
    fontSize: 16,
  },
  aiCitator: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
