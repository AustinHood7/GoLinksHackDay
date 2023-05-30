import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Roboto } from 'next/font/google';
import axios from 'axios';
 

export default function Home() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commits, setCommits] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    //this will fetch data in a loop until it returns an empty array
    const fetchData = async () => {
      let page = 1;
      let fetchedRepos = [];
      while (true) {
        try {
          const result = await axios.get(
            'https://api.github.com/search/repositories', {
              params: {
                q: 'user:netflix',
                sort: 'stars',
                order: 'desc',
                page: page,
              },
            }
          );

          //here is what will exit the loop
          if (result.data.items.length === 0) {
            break;
          }

          fetchedRepos = [...fetchedRepos, ...result.data.items];
          page++;
        } catch (error) {
          console.error("Error fetching data", error);
          break;
        }
      }
      
      setRepos(fetchedRepos);
      setLoading(false);
    };

    fetchData();
  }, []);

  const fetchCommits = async (repoName) => {
    try {
      const result = await axios.get(
        `https://api.github.com/repos/netflix/${repoName}/commits`
      );

      setCommits(result.data);
    } catch (error) {
      console.error("Error fetching commits", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    console.log("setIsOpen")
  };

  return (
    <div className='flex flex-col items-center pt-10 bg-slate-900 text-sky-100'>
      <h1 className='text-4xl'>Welcome to my GoLinks FrontEnd Project</h1>
      <h2 className='text-3xl text-sky-300 mt-5'>Author: Austin Hood</h2>
      <ul className=''>
        {repos.map((repo) => (
          <div className='border rounded-xl my-10 max-w-[50%] mx-auto px-10 flex'>
            <div className=''>
              <li key={repo.id} className='my-5'>
                <h2 className='text-2xl pb-5'>{repo.name}</h2>
                <p className='pb-2'>{repo.description}</p>
                <p className='pb-2'>Language: {repo.language}</p>
                <p className='pb-2'> Stars: {repo.stargazers_count}</p>
                <p className='pb-2'>Forks: {repo.forks_count}</p>
                <p className='mb-5'>Created at: {new Date(repo.created_at).toLocaleDateString()}</p>
                <button onClick={() => {
                  setSelectedRepo(repo.name);
                  fetchCommits(repo.name);
                  toggleDropdown();
                }} className='border-0 rounded-xl bg-sky-300 text-slate-900 p-3'>
                  Show Commits
                </button>
                
              </li>
            </div>
            
            {isOpen && (
        <div className="my-5 rounded-md shadow-lg bg-sky-300 text-slate-900 px-5 overflow-y-scroll max-h-[30rem] ml-[250px]">
          <h1 className="text-3xl font-bold my-4">Commits for {selectedRepo}</h1>
          <ul>
            {commits.map((commit) => (
              <li key={commit.sha} className="mb-4 p-4 border rounded-xl border-slate-900 ">
                <p className="font-bold">Message: {commit.commit.message}</p>
                <p>Committer: {commit.commit.committer.name}</p>
                <p className='max-w-[25%]'>Hash: {commit.sha}</p>
                <p>Date: {new Date(commit.commit.committer.date).toLocaleDateString()}</p>
              
              </li>
              
            ))}
          </ul>
        </div>
      )}
          </div>
          
        ))}
        
      </ul>

    </div>
  );
};


