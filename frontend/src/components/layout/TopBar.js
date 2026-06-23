import React from 'react';

const TopBar = ({ activeView, setActiveView, team = [] }) => {
  const showTabs = ['Kanban Board', 'Timeline', 'Backlog'].includes(activeView);
  
  const displayedTeam = team.slice(0, 3);
  const remainingCount = team.length > 3 ? team.length - 3 : 0;

  return (
    <div className="h-12 border-b border-slate-700 bg-background-base flex items-center px-6 justify-between shrink-0">
      <div className="flex items-center gap-6 h-full">
        {showTabs ? (
          <>
            <button
              onClick={() => setActiveView('Kanban Board')}
              className={`h-full px-1 flex items-center text-sm font-medium border-b-2 transition-all-150 ${
                activeView === 'Kanban Board'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setActiveView('Timeline')}
              className={`h-full px-1 flex items-center text-sm font-medium border-b-2 transition-all-150 ${
                activeView === 'Timeline'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveView('Backlog')}
              className={`h-full px-1 flex items-center text-sm font-medium border-b-2 transition-all-150 ${
                activeView === 'Backlog'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Backlog
            </button>
          </>
        ) : (
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">{activeView}</h2>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {displayedTeam.map((member) => {
            const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            return (
              <div
                key={member.id}
                className="w-7 h-7 rounded-full bg-slate-700 border-2 border-background-base flex items-center justify-center text-[10px] font-bold text-slate-100 hover:bg-slate-600 cursor-pointer transition-colors"
                title={member.name}
              >
                {initials || member.id.toString().substring(0, 2)}
              </div>
            );
          })}
          
          {remainingCount > 0 && (
            <div 
              className="w-7 h-7 rounded-full bg-indigo-500/20 border-2 border-background-base flex items-center justify-center text-[10px] font-bold text-indigo-400"
              title={`${remainingCount} more members`}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
