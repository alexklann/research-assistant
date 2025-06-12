import { StyleSheet, View, Text, TextInput, TouchableWithoutFeedback, Keyboard, Pressable, ScrollView } from 'react-native';
import { useDebouncedCallback } from 'use-debounce';
import { useEffect, useState } from 'react';

type SearchResult = {
  title: string;
  authors: any[];
};

export default function SearchScreen() {
  const [searchData, setSearchData] = useState<SearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState<'search' | 'detail'>('search');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'error' | 'notfound'>('idle');
  const [aiStatus, setAIStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [crewResponses, setCrewResponses] = useState({
    'summarizer': '',
    'citator': '',
  });

  interface Author {
    name: string;
  }

  const [paperContents, setPaperContents] = useState({
    title: '',
    authors: [] as Author[],
    abstract: '',
    fullText: '',
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
      await fetch(`http://192.168.1.28:8000/v1/search?query=${value}`)
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
          console.error(error);
        });
    },
    500
  )

  useEffect(() => {
    if (paperContents.title !== '') {
      
    }
  }, [paperContents])

  const setPaper = (paper: any) => {
    let tempPaperContents = {
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      fullText: paper.fullText,
      publishedDate: paper.publishedDate,
      id: paper.id,
    }
    const fetchAIResponses = async () => {
      let requestBody = JSON.stringify({
          "paper_content": tempPaperContents.abstract,
          "authors": tempPaperContents.authors.map(author => author.name).toString(),
          "title": tempPaperContents.title,
          "year": new Date(tempPaperContents.publishedDate).getFullYear().toString(),
        });
      console.log(requestBody)
      await fetch(`http://192.168.1.28:8000/v1/crew/run`, {
        method: 'POST',
        body: JSON.stringify({
          "paper_content": tempPaperContents.abstract,
          "authors": tempPaperContents.authors.map(author => author.name).toString(),
          "title": tempPaperContents.title,
          "journal": "",
          "year": new Date(tempPaperContents.publishedDate).getFullYear().toString(),
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setCrewResponses({
          'summarizer': data.summarizer_output,
          'citator': data.citator_output,
        });
        setAIStatus('idle');
      })
      .catch(error => {
        console.error('Error fetching AI responses:', error);
        setAIStatus('error');
      });
    }
    setPaperContents(tempPaperContents);
    setAIStatus('loading');
    setCurrentPage('detail');
    fetchAIResponses();
  }

  if (currentPage === 'search') {
    return (
      <View style={styles.container}>
        <Text style={styles.appTitle}>pAIper</Text>
        <TextInput
          style={styles.searchBar}
          placeholder='Search for paper'
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
      <View style={styles.container}>
        <Text style={styles.appTitle}>pAIper</Text>
        <Pressable onPress={() => {setCurrentPage('search')}}>
          <Text style={styles.backButton}>Back</Text>
        </Pressable>
        <View style={{flex: 1}}>
          {paperContents.title !== "" ? (
            <ScrollView style={{ flex: 1 }}>
              <Text style={styles.paperTitle}>{paperContents.title}</Text>
              <Text style={{ color: '#fff' }}>{new Date(paperContents.publishedDate).toLocaleDateString('de')}</Text>
              <Text style={styles.paperAuthors}>{paperContents.authors.length > 1 ? paperContents.authors.map(author => author.name).join(', ') : paperContents.authors[0].name}</Text>
              {aiStatus === 'loading' ? (
                <View style={styles.aiContainer}>
                  <Text style={styles.aiCitator}>AI is thinking...</Text>
                </View>
              ): aiStatus === 'error' ? (
                <Text style={{ color: '#fff' }}>There was an error generating ai responses</Text>
              ): (
                <View style={styles.aiContainer}>
                  <Text style={styles.aiSummarizer}>{crewResponses.summarizer}</Text>
                  <Text style={styles.aiCitator}>{crewResponses.citator}</Text>
                </View>
              )}
              <Text style={{ color: '#fff' }}>{paperContents.fullText}</Text>
            </ScrollView>
          ): (
            <Text>An error occured during the loading of this paper.</Text>
          )}
        </View>
      </View>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 72,
    paddingHorizontal: 32
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
    borderColor: '#fff',
    padding: 16,
    marginVertical: 16,
    backgroundColor: '#222',
  },
  aiSummarizer: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  aiCitator: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold'
  }
});
