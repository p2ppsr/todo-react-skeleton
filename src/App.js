/**
 * src/App.js
 * 
 * This file contains the primary business logic and UI code for the ToDo 
 * application.
 */
import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  AppBar, Toolbar, List, ListItem, ListItemText, ListItemIcon, Checkbox, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, TextField,
  Button, Fab, LinearProgress, Typography, IconButton
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import GitHubIcon from '@mui/icons-material/GitHub'
import BabbageSDK from '@babbage/sdk'
import PushDrop from 'pushdrop'

const TODO_PROTO_ADDR = 'my todo protocol'

// These are some basic styling rules for the React application.
// This app uses React (https://reactjs.org) for its user interface.
// We are also using MUI (https://mui.com) for buttons and dialogs.
// This stylesheet uses a language called JSS.
const useStyles = makeStyles({
  app_bar_placeholder: {
    height: '4em'
  },
  add_fab: {
    position: 'fixed',
    right: '1em',
    bottom: '1em',
    zIndex: 10
  },
  loading_bar: {
    margin: '1em'
  },
  github_icon: {
    color: '#ffffff'
  },
  app_bar_grid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridGap: '1em'
  },
  no_items: {
    margin: 'auto',
    textAlign: 'center',
    marginTop: '5em'
  }
}, { name: 'App' })

const App = () => {
  // These are some state variables that control the app's interface.
  const [createOpen, setCreateOpen] = useState(false)
  const [createTask, setCreateTask] = useState('')
  const [createAmount, setCreateAmount] = useState(1000)
  const [createLoading, setCreateLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [completeOpen, setCompleteOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState({})
  const [completeLoading, setCompleteLoading] = useState(false)
  const classes = useStyles()

  // This populates their ToDo list.
  useEffect(() => {
    (async () => {
      try {
        
        // --- business logic would go here ---
        console.log('Loaded the ToDo tasks when the page loaded!')
        const newTasks = []
        setTasks(newTasks) // Pretend data, make sure to replace!

      } catch (e) {
        toast.error(`Failed to load ToDo tasks! Error: ${e.message}`)
        console.error(e)
      } finally {
        setTasksLoading(false)
      }
    })()
  }, [])

  // This function will run when the user clicks "OK" in the creation dialog.
  const handleCreateSubmit = async e => {
    e.preventDefault() // Stop the HTML form from reloading the page.
    try {
      // Here, we handle some basic mistakes the user might have made.
      if (!createTask) {
        toast.error('Enter a task to complete!')
        return
      }
      if (!createAmount) {
        toast.error('Enter an amount for the new task!')
        return
      }
      if (Number(createAmount) < 500) {
        toast.error('The amount must be more than 200 satoshis!')
        return
      }
      // Now, we start a loading bar before the business logic starts.
      setCreateLoading(true)

      // --- business logic would go here ---
      console.log('Clicked the "OK" button in the Create Task dialog!')
      const serializedTask = [
        Buffer.from(TODO_PROTO_ADDR),
        Buffer.from(createTask)
      ]
      console.log('Serialized task: ', serializedTask)
      const bitcoinOutputScript = await PushDrop.create({
        fields: serializedTask,
        protocolID: 'todo list',
        keyID: '1'
      })
      console.log('Created Bitcoin output script: ', bitcoinOutputScript)

      const newToDoToken = await BabbageSDK.createAction({
        outputs: [{
          satoshis: Number(createAmount),
          script: bitcoinOutputScript
        }],
        description: `Create a TODO task: "${createTask}"`
      })
      console.log('Got New ToDo Token: ', newToDoToken)

      setTasks(originalTasks => ([
        {
          task: createTask,
          sats: Number(createAmount),
          token: {
            ...newToDoToken,
            lockingScript: bitcoinOutputScript,
            outputIndex: 0
          }
        },
        ...originalTasks
      ]))

      setCreateTask('')
      setCreateAmount(1000)
      setCreateOpen(false)
    } catch (e) {
      // Any errors are shown on the screen and printed in the developer console
      toast.error(e.message)
      console.error(e)
    } finally {
      setCreateLoading(false)
    }
  }

  // Opens the completion dialog for the selected task
  const openCompleteModal = task => () => {
    setSelectedTask(task)
    setCompleteOpen(true)
  }

  // This function runs when the user clicks the "complete" button on the 
  // completion dialog.
  const handleCompleteSubmit = async e => {
    e.preventDefault() // Stop the HTML form from reloading the page.
    try {
      // Start a loading bar to let the user know we're working on it.
      setCompleteLoading(true)

      // --- business logic would go here ---
      console.log('Clicked the "Complete" button in the Complete Task dialog!')
      console.log('Selected task: ', selectedTask)
      const unlockingScript = await PushDrop.redeem({
        protocolID: 'todo list',
        keyID: '1',
        prevTxId: selectedTask.token.txid,
        outputIndex: selectedTask.token.outputIndex,
        lockingScript: selectedTask.token.lockingScript,
        outputAmount: selectedTask.sats
      })
      console.log('Got token unlocking script', unlockingScript)

      const tokenRedemption = await BabbageSDK.createAction({
        description: `Complete a TODO task: "${selectedTask.task}"`,
        inputs: {
          [selectedTask.token.txid]: {
            ...selectedTask.token,
            outputsToRedeem: [{
              index: selectedTask.token.outputIndex,
              unlockingScript
            }]
          }
        }
      })
      console.log('Token redemption transaction', tokenRedemption)
      setTasks(oldTasks => {
        oldTasks.splice(oldTasks.findIndex(x => x === selectedTask), 1)
        return oldTasks
      })

      setSelectedTask({})
      setCompleteOpen(false)
    } catch (e) {
      toast.error(`Error completing task: ${e.message}`)
      console.error(e)
    } finally {
      setCompleteLoading(false)
    }
  }

  // User interface code
  return (
    <>
      {/* This shows the user success messages and errors */}
      <ToastContainer />

      {/* here's the app title bar */}
      <AppBar>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ToDo List — Get Rewarded!
          </Typography>
          <IconButton
            size='large'
            color='inherit'
            onClick={() => {
              window.open('https://github.com/p2ppsr/todo-react', '_blank')
            }}
          >
            <GitHubIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div className={classes.app_bar_placeholder} />

      {/* Here's the plus button that hangs out at the bottom-right */}
      <div className={classes.add_fab}>
        <Fab color='secondary' onClick={() => setCreateOpen(true)}>
          <AddIcon />
        </Fab>
      </div>

      {/* This bit shows a loading bar, or the list of tasks */}
      {tasksLoading
        ? <LinearProgress className={classes.loading_bar} />
        : (
          <List>
            {tasks.length === 0 && (
              <div className={classes.no_items}>
                <Typography variant='h4'>No ToDo Items</Typography>
                <Typography color='textSecondary'>
                  Use the<AddIcon color='primary' />button below to start a task
                </Typography>
              </div>
            )}
            {tasks.map((x, i) => (
              <ListItem
                key={i}
                button
                onClick={openCompleteModal(x)}
              >
                <ListItemIcon><Checkbox checked={false} /></ListItemIcon>
                <ListItemText
                  primary={x.task}
                  secondary={`${x.sats} satoshis`}
                />
              </ListItem>
            ))}
          </List>
        )}

      {/* This is the dialog for creating a new task */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle>
            Create a Task
          </DialogTitle>
          <DialogContent>
            <DialogContentText paragraph>
              Describe your task and set aside some satoshis you'll get back once
              it's done.
            </DialogContentText>
            <TextField
              multiline rows={3} fullWidth autoFocus
              label='Task to complete'
              onChange={e => setCreateTask(e.target.value)}
              value={createTask}
            />
            <br />
            <br />
            <TextField
              fullWidth type='number' min={100}
              label='Completion amount'
              onChange={e => setCreateAmount(e.target.value)}
              value={createAmount}
            />
          </DialogContent>
          {createLoading
            ? <LinearProgress className={classes.loading_bar} />
            : (
            <DialogActions>
              <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type='submit'>OK</Button>
            </DialogActions>
          )}
        </form>
      </Dialog>

      {/* Finally, this is the dialog for completing a ToDo task */}
      <Dialog open={completeOpen} onClose={() => setCompleteOpen(false)}>
        <form onSubmit={handleCompleteSubmit}>
          <DialogTitle>
            Complete "{selectedTask.task}"?
          </DialogTitle>
          <DialogContent>
            <DialogContentText paragraph>
              By marking this task as complete, you'll receive back your {selectedTask.sats} satoshis.
            </DialogContentText>
          </DialogContent>
          {completeLoading
            ? <LinearProgress className={classes.loading_bar} />
            : (
            <DialogActions>
              <Button onClick={() => setCompleteOpen(false)}>Cancel</Button>
              <Button type='submit'>Complete Task</Button>
            </DialogActions>
          )}
        </form>
      </Dialog>
    </>
  )
}

export default App
