// ============================================================================
// LEVERAGE AI - CMS BACKEND API
// Cloudflare Workers with AI, Vectorize, and KV Storage
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Enable CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    };
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200, 
        headers: corsHeaders 
      });
    }
    
    try {
      // API Routes for CMS
      if (path.startsWith('/api/content')) {
        return handleContent(request, env, corsHeaders);
      } else if (path.startsWith('/api/search')) {
        return handleSearch(request, env, corsHeaders);
      } else if (path.startsWith('/api/users')) {
        return handleUsers(request, env, corsHeaders);
      } else if (path.startsWith('/api/media')) {
        return handleMedia(request, env, corsHeaders);
      } else if (path.startsWith('/api/ai')) {
        return handleAI(request, env, corsHeaders);
      } else if (path.startsWith('/api/analytics')) {
        return handleAnalytics(request, env, corsHeaders);
      } else if (path === '/api/health') {
        return handleHealth(request, env, corsHeaders);
      }
    
      // Default response
      return new Response(JSON.stringify({ 
        message: 'LEVERAGE AI CMS API',
        version: env.CMS_VERSION || '1.0.0',
        environment: env.ENVIRONMENT || 'development',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        details: env.ENVIRONMENT === 'development' ? error.message : 'Server error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// ============================================================================
// CONTENT MANAGEMENT ENDPOINTS
// ============================================================================

async function handleContent(request, env, corsHeaders) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  try {
    if (method === 'GET' && pathSegments.length === 2) {
      // GET /api/content - List all content
      return listContent(request, env, corsHeaders);
    } else if (method === 'GET' && pathSegments.length === 3) {
      // GET /api/content/:id - Get specific content
      const contentId = pathSegments[2];
      return getContent(contentId, env, corsHeaders);
    } else if (method === 'POST' && pathSegments.length === 2) {
      // POST /api/content - Create new content
      return createContent(request, env, corsHeaders);
    } else if (method === 'PUT' && pathSegments.length === 3) {
      // PUT /api/content/:id - Update content
      const contentId = pathSegments[2];
      return updateContent(contentId, request, env, corsHeaders);
    } else if (method === 'DELETE' && pathSegments.length === 3) {
      // DELETE /api/content/:id - Delete content
      const contentId = pathSegments[2];
      return deleteContent(contentId, env, corsHeaders);
    }

    return new Response(JSON.stringify({ error: 'Invalid content endpoint' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Content error:', error);
    return new Response(JSON.stringify({ error: 'Content operation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================================================
// CONTENT CRUD OPERATIONS
// ============================================================================

async function listContent(request, env, corsHeaders) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit')) || 20;
  const offset = parseInt(url.searchParams.get('offset')) || 0;

  // In a real implementation, you'd query D1 or KV for content list
  // For now, return mock data structure
  const content = {
    items: [],
    total: 0,
    limit,
    offset
  };

  return new Response(JSON.stringify(content), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getContent(contentId, env, corsHeaders) {
  try {
    const content = await env.CONTENT.get(`content:${contentId}`);
    
    if (!content) {
      return new Response(JSON.stringify({ error: 'Content not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(content, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get content error:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve content' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function createContent(request, env, corsHeaders) {
  try {
    const contentData = await request.json();
    const contentId = `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate required fields
    if (!contentData.title || !contentData.content) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: title, content'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create content object
    const content = {
      id: contentId,
      title: contentData.title,
      content: contentData.content,
      slug: generateSlug(contentData.title),
      status: contentData.status || 'draft',
      tags: contentData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: contentData.author || 'system'
    };

    // Store in KV
    await env.CONTENT.put(`content:${contentId}`, JSON.stringify(content));

    // Generate embedding for search if content is substantial
    if (content.content.length > 100) {
      try {
        const embedding = await generateEmbedding(
          `${content.title} ${content.content}`, 
          env
        );

        // Store in Vectorize for search
        await env.SEARCH_INDEX.upsert([{
          id: contentId,
          values: embedding,
          metadata: {
            title: content.title,
            slug: content.slug,
            status: content.status,
            created_at: content.created_at,
            type: 'content'
          }
        }]);

      } catch (embeddingError) {
        console.error('Embedding generation failed:', embeddingError);
        // Continue without embedding - content is still created
      }
    }

    return new Response(JSON.stringify(content), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Create content error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create content' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function updateContent(contentId, request, env, corsHeaders) {
  try {
    const updateData = await request.json();
    const existingContent = await env.CONTENT.get(`content:${contentId}`);

    if (!existingContent) {
      return new Response(JSON.stringify({ error: 'Content not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const content = JSON.parse(existingContent);
    
    // Update fields
    content.title = updateData.title || content.title;
    content.content = updateData.content || content.content;
    content.status = updateData.status || content.status;
    content.tags = updateData.tags || content.tags;
    content.updated_at = new Date().toISOString();

    if (updateData.title) {
      content.slug = generateSlug(updateData.title);
    }

    // Store updated content
    await env.CONTENT.put(`content:${contentId}`, JSON.stringify(content));

    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update content error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update content' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function deleteContent(contentId, env, corsHeaders) {
  try {
    const existingContent = await env.CONTENT.get(`content:${contentId}`);

    if (!existingContent) {
      return new Response(JSON.stringify({ error: 'Content not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Delete from KV
    await env.CONTENT.delete(`content:${contentId}`);

    // Delete from search index
    try {
      await env.SEARCH_INDEX.deleteByIds([contentId]);
    } catch (vectorError) {
      console.error('Vector deletion failed:', vectorError);
      // Continue - content is deleted from KV
    }

    return new Response(JSON.stringify({ 
      message: 'Content deleted successfully',
      id: contentId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Delete content error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete content' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

async function handleSearch(request, env, corsHeaders) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const limit = parseInt(url.searchParams.get('limit')) || 10;

  if (!query) {
    return new Response(JSON.stringify({ error: 'Query parameter required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Generate embedding for search query
    const embedding = await generateEmbedding(query, env);
    
    // Search vector database
    const results = await env.SEARCH_INDEX.query(embedding, {
      topK: limit,
      returnValues: false,
      returnMetadata: 'all'
    });

    const searchResults = results.matches.map(match => ({
      id: match.id,
      score: match.score,
      title: match.metadata.title,
      slug: match.metadata.slug,
      status: match.metadata.status,
      created_at: match.metadata.created_at,
      type: match.metadata.type
    }));

    return new Response(JSON.stringify({
      query,
      results: searchResults,
      total: searchResults.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================================================
// AI INTEGRATION
// ============================================================================

async function handleAI(request, env, corsHeaders) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'generate') {
    return handleAIGenerate(request, env, corsHeaders);
  } else if (action === 'summarize') {
    return handleAISummarize(request, env, corsHeaders);
  }

  return new Response(JSON.stringify({ error: 'Invalid AI action' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAIGenerate(request, env, corsHeaders) {
  try {
    const { prompt, type = 'content' } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use Cloudflare Workers AI for content generation
    const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [
        {
          role: 'system',
          content: `You are a helpful content writer for a CMS. Generate ${type} content that is well-structured and engaging.`
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return new Response(JSON.stringify({
      generated_content: response.response,
      prompt,
      type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI generation error:', error);
    return new Response(JSON.stringify({ error: 'AI generation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function generateEmbedding(text, env) {
  try {
    const response = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
      text: [text]
    });

    const embedding = response.data[0];
    if (embedding.length !== 768) {
      throw new Error(`Expected 768 dimensions, got ${embedding.length}`);
    }
    
    return embedding;

  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw error;
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// ============================================================================
// PLACEHOLDER HANDLERS
// ============================================================================

async function handleUsers(request, env, corsHeaders) {
  return new Response(JSON.stringify({ message: 'Users endpoint - Coming soon' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleMedia(request, env, corsHeaders) {
  return new Response(JSON.stringify({ message: 'Media endpoint - Coming soon' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAnalytics(request, env, corsHeaders) {
  return new Response(JSON.stringify({ message: 'Analytics endpoint - Coming soon' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleHealth(request, env, corsHeaders) {
  return new Response(JSON.stringify({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: env.CMS_VERSION || '1.0.0',
    environment: env.ENVIRONMENT || 'development'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}