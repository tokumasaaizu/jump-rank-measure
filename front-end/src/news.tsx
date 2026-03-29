import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Container,
  Chip,
  Box
} from '@mui/material';
import HomeHeaderNavi from './components/Nav/newspageheader';
import Grid from '@mui/material/Grid';
import Footer from "./components/Footer/footer";

interface BlogPost {
  id: number;
  title: string;
  date: string;
  thumbnail: string;
  excerpt: string;
  category: string;
  link?: string;
}

const News: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    //    fetch('/blogPosts.json')
    fetch('/blogPosts.json')
      .then(response => response.json())
      .then(data => {
        setPosts(data.posts);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading blog posts:', error);
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

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
          fontWeight: 'bold'
        }}>
          ニュース＆ブログ
        </Typography>

        <Grid container spacing={4}>
          {posts.map((post,i) => (
              <Card 
                component="a"
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  textDecoration: 'none',
                  cursor: post.link ? 'pointer' : 'default',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={post.thumbnail}
                  alt={post.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={post.category}
                      size="small"
                      sx={{
                        backgroundColor: '#009879',
                        color: 'white',
                        mb: 1
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="p"
                      sx={{ ml: 1, display: 'inline-block' }}
                    >
                      {new Date(post.date).toLocaleDateString('ja-JP')}
                    </Typography>
                  </Box>
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="h2"
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 2,
                      lineHeight: 1.4
                    }}
                  >
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.excerpt}
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

export default News;