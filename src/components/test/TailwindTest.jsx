import React from 'react';

const TailwindTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Tailwind CSS Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Test Card 1</p>
                <p className="text-3xl font-bold text-gray-900">123</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
            </div>
            {/* Mini Chart */}
            <div className="h-16 flex items-end space-x-1">
              {[65, 72, 68, 80, 75, 85, 90].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                  style={{ height: `${height}%`, width: '12px' }}
                ></div>
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Test Card 2</p>
                <p className="text-3xl font-bold text-gray-900">456</p>
                <p className="text-xs text-red-600 mt-1">+3 new today</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
            </div>
            {/* Mini Chart */}
            <div className="h-16 flex items-end space-x-1">
              {[40, 35, 45, 30, 25, 20, 15].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-red-500 to-red-400 rounded-t"
                  style={{ height: `${height}%`, width: '12px' }}
                ></div>
              ))}
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Test Card 3</p>
                <p className="text-3xl font-bold text-gray-900">789</p>
                <p className="text-xs text-blue-600 mt-1">2 due this week</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
            </div>
            {/* Mini Chart */}
            <div className="h-16 flex items-end space-x-1">
              {[55, 60, 65, 70, 75, 80, 85].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                  style={{ height: `${height}%`, width: '12px' }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
            Primary Button
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200">
            Secondary Button
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
            Success Button
          </button>
        </div>

        {/* Test Typography */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Typography Test</h2>
          <p className="text-gray-600 mb-2">This is a paragraph with <span className="font-semibold text-blue-600">bold text</span> and <span className="italic text-green-600">italic text</span>.</p>
          <p className="text-sm text-gray-500">This is smaller text with different styling.</p>
        </div>

        {/* Custom CSS Test */}
        <div className="mt-8">
          <div className="test-css">
            <h3 className="text-xl font-bold mb-2">Custom CSS Test</h3>
            <p>If you can see this styled with a gradient background, CSS processing is working!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
