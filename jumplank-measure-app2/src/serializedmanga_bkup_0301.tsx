import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Container,
  Chip,
  Box,
  CardActionArea
} from '@mui/material';
import HomeHeaderNavi from './components/Nav/seriespageheader';
import Grid from '@mui/material/Grid';
import Footer from "./components/Footer/footer";
import { Link as RouterLink } from 'react-router-dom';
import Link from "@mui/material/Link";

interface Works {
    work_id: number;
    title: string;
    author: string;
    image_url: string;
    serialization_start_date: Date;
}

const SerializedManga: React.FC = () => {
  const [posts, setPosts] = useState<Works[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);

    // Goで構築したAPIへの通信
    fetch('http://localhost:8080/works')
    .then((response) => {
      if (!response.ok) {
        throw new Error('API error');
      }
      return response.json();
    })
    .then((data) => {
      // Goが配列を直接返す場合
      setPosts(data);
      // もし { posts: [...] } の形なら ↓ に変更
      // setPosts(data.posts);
      setIsLoading(false);
    })
    .catch((err) => {
      console.error('Error loading works:', err);
      setError(err.message);
      setIsLoading(false);
    });

    /** 
    fetch('/jumprank/serializedmanga.json')
    //fetch("http://localhost:8080/works")
      .then(response => response.json())
      .then(data => {
        setPosts(data.posts);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading blog posts:', error);
        setError(error.message);
        setIsLoading(false);
      });*/

  }, []); // useEffect


  if (isLoading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  return (
    <>
      <HomeHeaderNavi />
      <Container>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          textAlign: 'center', 
          my: 4,
          fontWeight: 'bold',
        }}>
          現在連載中の作品一覧
        </Typography>

        <Grid container spacing={4}>
          {posts.map((post,i) => (
              <Card 
                component="a"
                //href={`/detail?title=${encodeURIComponent(post.title)}`}
                href={`/jumprank/detail?title=${encodeURIComponent(post.title)}`}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: '16px',
                  background: 'linear-gradient(145deg, #ffffff, #f6f7f9)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.06)',
                  transform: 'translateY(0)',
                  border: 'none',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 12px 12px rgba(0,0,0,0.08)',
                  }
                }}
              >
                <CardActionArea 
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={post.image_url}
                    alt={post.title}
                    sx={{ 
                      objectFit: 'cover',
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                </CardActionArea>
                <CardContent sx={{ 
                  flexGrow: 1,
                  p: 3,
                  '&:last-child': { pb: 3 }
                }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="p"                      
                      sx={{ 
                        ml: 1, 
                        display: 'inline-block',
                        fontSize: '0.85rem',
                        fontWeight: 500
                      }}
                    >
                      {/**{post.serialization_start_date}*/}
                    </Typography>
          
                  </Box>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="h2"
                    
                    sx={{ 
                      fontWeight: 700,
                      mb: 2,
                      lineHeight: 1.4,
                      fontSize: '1.25rem',
                      color: '#1a1a1a',
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: '#009879'
                      }
                    }}
                  >
                    {/**<Link href={`/detail?title=${encodeURIComponent(post.title)}`}>{post.title}</Link>*/}
                    <Link href={`/jumprank/detail?title=${encodeURIComponent(post.title)}`}>{post.title}</Link>
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.6,
                      color: '#666666',
                      fontSize: '0.95rem'
                    }}
                  >
                    {/**{post.excerpt}*/}
                  </Typography>
                </CardContent>
              </Card>

          ))}
        </Grid>
      </Container>
      <Footer/>
    </>
  );
};

export default SerializedManga;