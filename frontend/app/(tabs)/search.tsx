import { StyleSheet, View, Text, TextInput, TouchableWithoutFeedback, Keyboard, Pressable, ScrollView } from 'react-native';
import { useDebouncedCallback } from 'use-debounce';
import { useState } from 'react';
import storage from '@/utils/paperStorage';
import { PaperPage } from '@/components/PaperPage';
import { ResearchPaper } from "@/types/ResearchPaper";

type SearchResult = {
  title: string;
  authors: any[];
};

export default function SearchScreen() {
  const [searchData, setSearchData] = useState<SearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState<'search' | 'detail'>('search');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'error' | 'notfound'>('idle');

  const [paperContents, setPaperContents] = useState<ResearchPaper>({
    title: '',
    authors: [],
    abstract: '',
    fullText: '',
    downloadUrl: '',
    publishedDate: '',
    id: 0,
  });

  const debounced = useDebouncedCallback(
    async (value) => {
      if (value === '') {
        setSearchStatus('idle');
        setSearchData([]);
        return;
      }
      setSearchStatus('loading');
      setSearchData([]);
      const apiBaseURL = process.env.EXPO_PUBLIC_BACKEND_URL;
      await fetch(`${apiBaseURL}/v1/search?query=${value}`)
        .then(response => response.json())
        .then(data => {
          if (data.results.length === 0) {
            setSearchStatus('notfound');
            return;
          }
          setSearchData(data.results || []);
        })
        .catch(error => {
          setSearchStatus('error')
        });
    },
    500
  )

  const setPaper = (paper: any) => {
    let tempPaperContents: ResearchPaper = {
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      fullText: paper.fullText,
      downloadUrl: paper.downloadUrl,
      publishedDate: paper.publishedDate,
      id: paper.id,
    }

    setPaperContents(tempPaperContents);

    let saveData = {
      title: paper.title,
      id: paper.id,
    }

    storage.load({
      key: 'papers',
      autoSync: true,
      syncInBackground: true,
    }).then(ret => {
      const existingPapers = ret || [];
      const paperExists = existingPapers.some((p: any) => p.id === saveData.id);
      if (!paperExists) {
        existingPapers.push(saveData);
        storage.save({
          key: 'papers',
          data: existingPapers
        })
      }
    })
    setCurrentPage('detail');
  }

  if (currentPage === 'search') {
    return (
      <View style={styles.container}>
        <Text style={styles.appTitle}>pAIper</Text>
        <TextInput
          style={styles.searchBar}
          placeholder='Search for paper'
          placeholderTextColor="#aaa"
          onChangeText={(text) => debounced(text)}/>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={{ flex: 1, marginTop: 8 }}>
              {searchData.length > 0 ? (
                searchData.map((item, index) => (
                  <View key={index} style={{ marginVertical: 8 }}>
                    <Pressable onPress={() => {setPaper(item)}}>
                      <Text style={{ color: '#fff', fontSize: 16 }}>{item.title}</Text>
                      <Text style={{ color: '#aaa', fontSize: 14 }}>{item.authors[0].name}</Text>
                    </Pressable>
                  </View>
                ))
              ) : (
                searchStatus === 'loading' ? (
                  <Text style={styles.searchStatus}>Searching...</Text>
                ) : searchStatus === 'idle' ? (
                  <Text style={styles.searchStatus}>Start typing to search.</Text>
                ) : searchStatus === 'notfound' ? (
                  <Text style={styles.searchStatus}>No results found.</Text>
                ) : (
                  <Text style={styles.searchStatus}>An error occurred while searching.</Text>
                )
              )}
            </ScrollView>
        </TouchableWithoutFeedback>
      </View>
    );
  } else {
    return (
      <PaperPage
        paperContents={paperContents}
        setCurrentPage={setCurrentPage}
      />
    );
  }
}

const styles = StyleSheet.create({
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
})