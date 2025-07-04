import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, Pressable } from 'react-native';
import storage from '@/utils/paperStorage';
import { useEffect, useState } from 'react';
import { PaperPage } from '@/components/PaperPage';
import { ResearchPaper } from "@/types/ResearchPaper";

export default function HomeScreen() {
  const [oldPapers, setOldPapers] = useState([]);
  const [currentPage, setCurrentPage] = useState<'search' | 'detail'>('search');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper>({
    title: '',
    authors: [],
    abstract: '',
    fullText: '',
    downloadUrl: '',
    publishedDate: '',
    id: 0,
  });

  useEffect(() => {
    storage.load({
      key: 'papers'
    }).then(papers => {
      setOldPapers(papers);
    }).catch(error => {
      console.error('Failed to load papers:', error);
    });
  }, []);

  async function handlePaperPress(paperId: number) {
    setLoading(true);
    const apiBaseURL = process.env.EXPO_PUBLIC_BACKEND_URL;
      await fetch(`${apiBaseURL}/v1/paper/${paperId}`)
      .then(response => response.json())
      .then(data => {
        setSelectedPaper({
          title: data.title,
          authors: data.authors,
          abstract: data.abstract,
          fullText: data.fullText,
          downloadUrl: data.downloadUrl,
          publishedDate: data.publishedDate,
          id: data.id
        });
        setCurrentPage('detail');
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching paper details:', error);
        setLoading(false);
      });
  }

  if (currentPage === 'search') {
    return (
      <View style={styles.container}>
        <Text style={styles.appTitle}>pAIper</Text>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{flex: 1}}>
              <Text style={{ color: '#fff', marginTop: 20 }}>
                Continue where you left off...
              </Text>
              {!loading ? (
                oldPapers.length > 0 ? (
                  oldPapers.map((paper: { title: string, id: number }, index) => (
                    <Pressable onPress={() => handlePaperPress(paper.id)} key={index} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#444' }}>
                      <Text style={{ color: '#fff', fontSize: 16 }}>{paper.title}</Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={{ color: '#aaa', fontSize: 14 }}>No papers found.</Text>
                )
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, marginVertical: 16 }}>Loading...</Text>
              )}
            </View>
        </TouchableWithoutFeedback>
      </View>
    );
  } else {
    return (
      <PaperPage
        paperContents={selectedPaper}
        setCurrentPage={setCurrentPage}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 72,
    paddingHorizontal: 32,
    backgroundColor: '#121212'
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
    borderColor: '#fff',
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 24,
  }
});
